/** Recommendation rules ks-rules-1.0 — pure unit tests (no database). */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluateCrop, missingInputs, rankEvaluations, waterAccessLevel, type CropKnowledge, type FarmerConditions } from '../../src/recommendation/engine.ts';

const SRC = { id: 'src-1', title: 'Test source' };

function crop(overrides: Partial<CropKnowledge> = {}): CropKnowledge {
  return {
    cropId: 'c1', slug: 'test', name: 'Test crop',
    seasons: [{ code: 'KHARIF', source: SRC }],
    soils: [{ code: 'RED', suitability: 'SUITABLE', source: SRC }, { code: 'BLACK', suitability: 'NOT_SUITABLE', source: SRC }, { code: 'SANDY', suitability: 'MODERATELY_SUITABLE', source: SRC }],
    regions: [],
    requirements: [
      { id: 'r-ph', parameterCode: 'SOIL_PH', min: 5.5, max: 7.5, unitCode: 'PH', level: null, mandatory: true, source: SRC },
      { id: 'r-water', parameterCode: 'WATER_NEED', min: null, max: null, unitCode: null, level: 'HIGH', mandatory: false, source: SRC },
    ],
    economics: null,
    ...overrides,
  };
}

function farmer(overrides: Partial<FarmerConditions> = {}): FarmerConditions {
  return {
    seasonCode: 'KHARIF', soilTypeCode: 'RED', soilValues: { SOIL_PH: { value: 6.5, unitCode: 'PH' } },
    waterSources: [{ typeCode: 'BOREWELL', availability: 'PERENNIAL' }], regionNames: ['Karnataka'], budget: null, areaAcres: 2,
    ...overrides,
  };
}

describe('recommendation engine (ks-rules-1.0)', () => {
  it('marks a crop HIGHLY_SUITABLE when every evaluated criterion matches, with a sourced reason each', () => {
    const e = evaluateCrop(farmer(), crop());
    assert.equal(e.suitability, 'HIGHLY_SUITABLE');
    assert.deepEqual(e.reasons.map((r) => [r.criterion, r.result]), [['SEASON', 'SUITABLE'], ['SOIL_TYPE', 'SUITABLE'], ['SOIL_PH', 'SUITABLE'], ['WATER_NEED', 'SUITABLE']]);
    assert.ok(e.reasons.every((r) => r.source?.id === 'src-1'));
    assert.equal(e.reasons.find((r) => r.criterion === 'SOIL_PH')?.requirementId, 'r-ph');
  });

  it('excludes on a wrong season, unsuitable soil or a MANDATORY range miss', () => {
    assert.equal(evaluateCrop(farmer({ seasonCode: 'RABI' }), crop()).suitability, 'NOT_SUITABLE');
    assert.equal(evaluateCrop(farmer({ soilTypeCode: 'BLACK' }), crop()).suitability, 'NOT_SUITABLE');
    const ph = evaluateCrop(farmer({ soilValues: { SOIL_PH: { value: 8.4, unitCode: 'PH' } } }), crop());
    assert.equal(ph.suitability, 'NOT_SUITABLE');
    assert.equal(ph.reasons.find((r) => r.criterion === 'SOIL_PH')?.kind, 'EXCLUSION');
  });

  it('warns (not excludes) for moderate soil or a water shortfall on a non-mandatory need', () => {
    assert.equal(evaluateCrop(farmer({ soilTypeCode: 'SANDY' }), crop()).suitability, 'MODERATELY_SUITABLE');
    const rainOnly = evaluateCrop(farmer({ waterSources: [{ typeCode: 'RAINWATER', availability: 'SEASONAL' }] }), crop());
    assert.equal(rainOnly.reasons.find((r) => r.criterion === 'WATER_NEED')?.result, 'CAUTION');
    assert.equal(rainOnly.suitability, 'MODERATELY_SUITABLE');
  });

  it('reports missing inputs and missing knowledge as UNKNOWN — never guesses', () => {
    const e = evaluateCrop(farmer({ seasonCode: null, soilTypeCode: null, soilValues: {}, waterSources: [] }), crop());
    assert.equal(e.suitability, 'UNKNOWN');
    assert.ok(e.reasons.every((r) => r.result === 'UNKNOWN' && r.kind === 'MISSING_DATA'));
    const noKnowledge = evaluateCrop(farmer(), crop({ seasons: [], soils: [], requirements: [] }));
    assert.equal(noKnowledge.suitability, 'UNKNOWN');
    assert.ok(noKnowledge.reasons.some((r) => r.reasonCode === 'knowledge.season.none'));
  });

  it('never compares values in different units', () => {
    const e = evaluateCrop(farmer({ soilValues: { SOIL_PH: { value: 6.5, unitCode: 'PERCENT' } } }), crop());
    assert.equal(e.reasons.find((r) => r.criterion === 'SOIL_PH')?.result, 'UNKNOWN');
  });

  it('uses only sourced cost references for the budget check and scales them to the plot area', () => {
    const e = evaluateCrop(farmer({ budget: 30000, areaAcres: 2 }), crop({ economics: { id: 'e1', costMinPerAcre: 10000, costMaxPerAcre: 20000, referenceYear: 2024, source: SRC } }));
    assert.deepEqual(e.investment, { economicsId: 'e1', min: 20000, max: 40000, areaAcres: 2 });
    assert.equal(e.reasons.find((r) => r.criterion === 'BUDGET')?.result, 'CAUTION');
    assert.equal(evaluateCrop(farmer({ budget: 30000 }), crop()).investment, null, 'no economics → no figures');
  });

  it('derives water access from sources (documented rule)', () => {
    assert.equal(waterAccessLevel([]), null);
    assert.equal(waterAccessLevel([{ typeCode: 'RAINWATER', availability: 'SEASONAL' }]), 'LOW');
    assert.equal(waterAccessLevel([{ typeCode: 'OPEN_WELL', availability: 'SEASONAL' }]), 'MEDIUM');
    assert.equal(waterAccessLevel([{ typeCode: 'CANAL', availability: 'UNKNOWN' }, { typeCode: 'BOREWELL', availability: 'PERENNIAL' }]), 'HIGH');
  });

  it('ranks deterministically: level, then suitable count, then fewer unknowns, then name', () => {
    const a = evaluateCrop(farmer(), crop({ cropId: 'a', name: 'Alpha' }));
    const b = evaluateCrop(farmer({ soilTypeCode: 'BLACK' }), crop({ cropId: 'b', name: 'Beta' }));
    const c = evaluateCrop(farmer(), crop({ cropId: 'c', name: 'Gamma', requirements: [] }));
    assert.deepEqual(rankEvaluations([b, c, a]).map((e) => e.name), ['Alpha', 'Gamma', 'Beta']);
    assert.deepEqual(missingInputs({ ...farmer({ budget: null, soilValues: {} }), hasLocation: false }), ['LOCATION', 'SOIL_TEST', 'BUDGET']);
  });
});
