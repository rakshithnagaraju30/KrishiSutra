/**
 * KrishiSutra crop suitability rules — version ks-rules-1.0 (ADR 0007).
 *
 * PURE and DETERMINISTIC: no database, no network, no AI. Given the farmer's conditions and the
 * PUBLISHED, source-cited knowledge for each crop, it evaluates one criterion at a time and explains
 * each result. It never invents values: when knowledge or input is missing the result is UNKNOWN
 * (reported as missing data), and no numeric score is produced (no validated scoring method exists yet).
 *
 * Criteria and rules
 *   SEASON      crop's verified season mappings contain the chosen season → SUITABLE, else UNSUITABLE
 *   SOIL_TYPE   verified soil suitability row: HIGHLY_SUITABLE/SUITABLE → SUITABLE, MODERATELY → CAUTION,
 *               NOT_SUITABLE → UNSUITABLE
 *   SOIL_*      soil-test value vs published requirement range (same unit only): inside → SUITABLE;
 *               outside → UNSUITABLE if the requirement is MANDATORY, otherwise CAUTION
 *   WATER_NEED  crop's published water-need level vs the farmer's water access level
 *               (rain only → LOW; any seasonal/unreliable/unknown source → MEDIUM; any perennial source → HIGH):
 *               need ≤ access → SUITABLE; need one level above → CAUTION; more → UNSUITABLE if MANDATORY else CAUTION
 *   REGION      verified regional suitability for the farmer's region (same mapping as SOIL_TYPE)
 *   BUDGET      sourced cost-of-cultivation range × plot area vs budget: max ≤ budget → SUITABLE;
 *               min ≤ budget < max → CAUTION; budget < min → CAUTION (never excludes)
 *
 * Overall level: any UNSUITABLE → NOT_SUITABLE; else any CAUTION → MODERATELY_SUITABLE;
 *   else ≥ 3 SUITABLE → HIGHLY_SUITABLE; ≥ 1 SUITABLE → SUITABLE; none evaluated → UNKNOWN.
 * Ranking: level, then number of SUITABLE criteria, then fewer UNKNOWN, then name.
 */

export const RULE_SET_VERSION = 'ks-rules-1.0';

export type Level = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type Suitability = 'HIGHLY_SUITABLE' | 'SUITABLE' | 'MODERATELY_SUITABLE' | 'NOT_SUITABLE' | 'UNKNOWN';
export type Result = 'SUITABLE' | 'CAUTION' | 'UNSUITABLE' | 'UNKNOWN';
export type Kind = 'REASON' | 'WARNING' | 'EXCLUSION' | 'MISSING_DATA';

export type SourceRef = { id: string; title: string } | null;

export type FarmerConditions = {
  seasonCode: string | null;
  soilTypeCode: string | null;
  /** Soil-test values keyed by parameter code, with unit code. */
  soilValues: Record<string, { value: number; unitCode: string }>;
  /** Water sources the farmer has (availability as recorded). Empty = not provided. */
  waterSources: { typeCode: string; availability: 'PERENNIAL' | 'SEASONAL' | 'UNRELIABLE' | 'UNKNOWN' }[];
  regionNames: string[];
  budget: number | null;
  /** Plot area in acres (for scaling cost references), if known. */
  areaAcres: number | null;
};

export type CropKnowledge = {
  cropId: string;
  slug: string;
  name: string;
  seasons: { code: string; source: SourceRef }[];
  soils: { code: string; suitability: Exclude<Suitability, 'UNKNOWN'>; source: SourceRef }[];
  regions: { name: string; suitability: Exclude<Suitability, 'UNKNOWN'>; source: SourceRef }[];
  requirements: {
    id: string;
    parameterCode: string;
    min: number | null;
    max: number | null;
    unitCode: string | null;
    level: Level | null;
    mandatory: boolean;
    source: SourceRef;
  }[];
  /** Sourced cost-of-cultivation reference, already converted to "per acre". */
  economics: { id: string; costMinPerAcre: number | null; costMaxPerAcre: number | null; referenceYear: number; source: SourceRef } | null;
};

export type Reason = {
  kind: Kind;
  criterion: string;
  result: Result;
  reasonCode: string;
  message: string;
  observed: string | null;
  required: string | null;
  requirementId: string | null;
  source: SourceRef;
};

export type Evaluation = {
  cropId: string;
  slug: string;
  name: string;
  suitability: Suitability;
  reasons: Reason[];
  counts: { suitable: number; caution: number; unsuitable: number; unknown: number };
  investment: { economicsId: string; min: number | null; max: number | null; areaAcres: number } | null;
};

const LEVEL_ORDER: Level[] = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
const SUITABILITY_ORDER: Suitability[] = ['HIGHLY_SUITABLE', 'SUITABLE', 'MODERATELY_SUITABLE', 'UNKNOWN', 'NOT_SUITABLE'];
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
const range = (min: number | null, max: number | null, unit: string | null) =>
  `${min !== null ? fmt(min) : '…'}–${max !== null ? fmt(max) : '…'}${unit ? ` ${unit}` : ''}`;

/** The farmer's water access level derived from their sources (documented rule, see header). */
export function waterAccessLevel(sources: FarmerConditions['waterSources']): Level | null {
  if (sources.length === 0) return null;
  const irrigation = sources.filter((s) => s.typeCode !== 'RAINWATER');
  if (irrigation.length === 0) return 'LOW';
  if (irrigation.some((s) => s.availability === 'PERENNIAL')) return 'HIGH';
  return 'MEDIUM';
}

function fromSuitability(s: Exclude<Suitability, 'UNKNOWN'>): Result {
  return s === 'NOT_SUITABLE' ? 'UNSUITABLE' : s === 'MODERATELY_SUITABLE' ? 'CAUTION' : 'SUITABLE';
}
const kindFor = (r: Result): Kind => (r === 'UNSUITABLE' ? 'EXCLUSION' : r === 'CAUTION' ? 'WARNING' : r === 'UNKNOWN' ? 'MISSING_DATA' : 'REASON');

export function evaluateCrop(input: FarmerConditions, crop: CropKnowledge): Evaluation {
  const reasons: Reason[] = [];
  const add = (r: Omit<Reason, 'kind'> & { kind?: Kind }) => reasons.push({ kind: r.kind ?? kindFor(r.result), ...r });

  // SEASON
  if (!input.seasonCode) {
    add({ criterion: 'SEASON', result: 'UNKNOWN', reasonCode: 'missing.season', message: 'Season not provided.', observed: null, required: null, requirementId: null, source: null });
  } else if (crop.seasons.length === 0) {
    add({ criterion: 'SEASON', result: 'UNKNOWN', reasonCode: 'knowledge.season.none', message: 'No verified season information for this crop yet.', observed: input.seasonCode, required: null, requirementId: null, source: null });
  } else {
    const match = crop.seasons.find((s) => s.code === input.seasonCode);
    if (match) add({ criterion: 'SEASON', result: 'SUITABLE', reasonCode: 'season.grown', message: `Grown in the ${input.seasonCode} season.`, observed: input.seasonCode, required: crop.seasons.map((s) => s.code).join(', '), requirementId: null, source: match.source });
    else add({ criterion: 'SEASON', result: 'UNSUITABLE', reasonCode: 'season.not_grown', message: `Not listed for the ${input.seasonCode} season.`, observed: input.seasonCode, required: crop.seasons.map((s) => s.code).join(', '), requirementId: null, source: crop.seasons[0]?.source ?? null });
  }

  // SOIL_TYPE
  if (!input.soilTypeCode) {
    add({ criterion: 'SOIL_TYPE', result: 'UNKNOWN', reasonCode: 'missing.soil_type', message: 'Soil type not provided.', observed: null, required: null, requirementId: null, source: null });
  } else {
    const soil = crop.soils.find((s) => s.code === input.soilTypeCode);
    if (!soil) add({ criterion: 'SOIL_TYPE', result: 'UNKNOWN', reasonCode: 'knowledge.soil.none', message: 'No verified information for this soil type yet.', observed: input.soilTypeCode, required: null, requirementId: null, source: null });
    else {
      const result = fromSuitability(soil.suitability);
      add({ criterion: 'SOIL_TYPE', result, reasonCode: `soil.${soil.suitability.toLowerCase()}`, message: `Soil type ${input.soilTypeCode}: ${soil.suitability.replace(/_/g, ' ').toLowerCase()}.`, observed: input.soilTypeCode, required: null, requirementId: null, source: soil.source });
    }
  }

  // SOIL TEST PARAMETERS (only parameters that have both a requirement and a value)
  const soilRequirements = crop.requirements.filter((r) => r.parameterCode.startsWith('SOIL_') && (r.min !== null || r.max !== null));
  if (Object.keys(input.soilValues).length === 0 && soilRequirements.length > 0) {
    add({ criterion: 'SOIL_TEST', result: 'UNKNOWN', reasonCode: 'missing.soil_test', message: 'No soil test: soil nutrients and pH were not checked.', observed: null, required: null, requirementId: null, source: null });
  }
  for (const req of soilRequirements) {
    const value = input.soilValues[req.parameterCode];
    if (!value) continue;
    const required = range(req.min, req.max, req.unitCode);
    if (!req.unitCode || value.unitCode !== req.unitCode) {
      add({ criterion: req.parameterCode, result: 'UNKNOWN', reasonCode: 'soil_value.unit_mismatch', message: `${req.parameterCode}: units differ, not compared.`, observed: `${fmt(value.value)} ${value.unitCode}`, required, requirementId: req.id, source: req.source });
      continue;
    }
    const inside = (req.min === null || value.value >= req.min) && (req.max === null || value.value <= req.max);
    const result: Result = inside ? 'SUITABLE' : req.mandatory ? 'UNSUITABLE' : 'CAUTION';
    add({
      criterion: req.parameterCode, result,
      reasonCode: inside ? 'soil_value.within_range' : 'soil_value.outside_range',
      message: `${req.parameterCode} ${fmt(value.value)} is ${inside ? 'within' : 'outside'} the recommended ${required}.`,
      observed: `${fmt(value.value)} ${value.unitCode}`, required, requirementId: req.id, source: req.source,
    });
  }

  // WATER_NEED
  const need = crop.requirements.find((r) => r.parameterCode === 'WATER_NEED' && r.level);
  const access = waterAccessLevel(input.waterSources);
  if (!access) {
    add({ criterion: 'WATER_NEED', result: 'UNKNOWN', reasonCode: 'missing.water', message: 'Water source not provided.', observed: null, required: need?.level ?? null, requirementId: need?.id ?? null, source: need?.source ?? null });
  } else if (!need?.level) {
    add({ criterion: 'WATER_NEED', result: 'UNKNOWN', reasonCode: 'knowledge.water.none', message: 'No verified water-need information for this crop yet.', observed: access, required: null, requirementId: null, source: null });
  } else {
    const gap = LEVEL_ORDER.indexOf(need.level) - LEVEL_ORDER.indexOf(access);
    const result: Result = gap <= 0 ? 'SUITABLE' : gap === 1 ? 'CAUTION' : need.mandatory ? 'UNSUITABLE' : 'CAUTION';
    add({
      criterion: 'WATER_NEED', result,
      reasonCode: gap <= 0 ? 'water.enough' : 'water.short',
      message: gap <= 0 ? `Water need (${need.level}) fits your water access (${access}).` : `Needs more water (${need.level}) than your sources usually provide (${access}).`,
      observed: access, required: need.level, requirementId: need.id, source: need.source,
    });
  }

  // REGION (only when the crop has verified regional data matching one of the farmer's regions)
  const region = crop.regions.find((r) => input.regionNames.includes(r.name));
  if (region) {
    const result = fromSuitability(region.suitability);
    add({ criterion: 'REGION', result, reasonCode: `region.${region.suitability.toLowerCase()}`, message: `${region.name}: ${region.suitability.replace(/_/g, ' ').toLowerCase()}.`, observed: region.name, required: null, requirementId: null, source: region.source });
  }

  // BUDGET (never excludes; uses sourced references only)
  let investment: Evaluation['investment'] = null;
  if (input.budget !== null && crop.economics && input.areaAcres !== null && (crop.economics.costMinPerAcre !== null || crop.economics.costMaxPerAcre !== null)) {
    const e = crop.economics;
    const min = e.costMinPerAcre !== null ? Math.round(e.costMinPerAcre * input.areaAcres) : null;
    const max = e.costMaxPerAcre !== null ? Math.round(e.costMaxPerAcre * input.areaAcres) : null;
    investment = { economicsId: e.id, min, max, areaAcres: input.areaAcres };
    const fits = max !== null ? input.budget >= max : min !== null && input.budget >= min;
    add({
      criterion: 'BUDGET', result: fits ? 'SUITABLE' : 'CAUTION',
      reasonCode: fits ? 'budget.fits' : 'budget.may_not_fit',
      message: `Reference cost for your area (${e.referenceYear}): ₹${min ?? '…'}–₹${max ?? '…'}.`,
      observed: `₹${fmt(input.budget)}`, required: `₹${min ?? '…'}–₹${max ?? '…'}`, requirementId: null, source: e.source,
    });
  }

  const counts = {
    suitable: reasons.filter((r) => r.result === 'SUITABLE').length,
    caution: reasons.filter((r) => r.result === 'CAUTION').length,
    unsuitable: reasons.filter((r) => r.result === 'UNSUITABLE').length,
    unknown: reasons.filter((r) => r.result === 'UNKNOWN').length,
  };
  const suitability: Suitability =
    counts.unsuitable > 0 ? 'NOT_SUITABLE'
      : counts.caution > 0 ? 'MODERATELY_SUITABLE'
        : counts.suitable >= 3 ? 'HIGHLY_SUITABLE'
          : counts.suitable >= 1 ? 'SUITABLE'
            : 'UNKNOWN';
  return { cropId: crop.cropId, slug: crop.slug, name: crop.name, suitability, reasons, counts, investment };
}

export function rankEvaluations(evaluations: Evaluation[]): Evaluation[] {
  return [...evaluations].sort(
    (a, b) =>
      SUITABILITY_ORDER.indexOf(a.suitability) - SUITABILITY_ORDER.indexOf(b.suitability) ||
      b.counts.suitable - a.counts.suitable ||
      a.counts.unknown - b.counts.unknown ||
      a.name.localeCompare(b.name),
  );
}

export const INPUT_CODES = ['LOCATION', 'SOIL_TYPE', 'WATER_SOURCE', 'SOIL_TEST', 'SEASON', 'BUDGET'] as const;

export function missingInputs(input: FarmerConditions & { hasLocation: boolean }): string[] {
  const missing: string[] = [];
  if (!input.hasLocation) missing.push('LOCATION');
  if (!input.soilTypeCode) missing.push('SOIL_TYPE');
  if (input.waterSources.length === 0) missing.push('WATER_SOURCE');
  if (Object.keys(input.soilValues).length === 0) missing.push('SOIL_TEST');
  if (!input.seasonCode) missing.push('SEASON');
  if (input.budget === null) missing.push('BUDGET');
  return missing;
}
