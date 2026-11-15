/**
 * Format for source-cited crop content (one file per crop).
 *
 * RULES FOR CONTENT AUTHORS
 * - Every instruction, requirement and suitability row names the source (`source`) it was taken from.
 * - Text follows the source closely; numbers are copied exactly (no rounding, no unit conversion).
 * - Day ranges are only filled when the source states them.
 * - Chemical pesticide / herbicide / fungicide DOSES are never entered here: those need expert
 *   verification and a regulatory reference (DiseaseTreatment rules). Instructions point to the
 *   source and the local KVK instead.
 * - Content is published as SOURCE_CITED ("pending expert review"), per product decision D5.
 */
import type { QualitativeLevel, RequirementImportance, SafetyLevel, StageDayAnchor, StageResourceType, SuitabilityLevel } from '../../../generated/prisma/enums.ts';

export type SourceDef = {
  title: string;
  url: string;
  organization: string;
  /** Year shown on the page ("Updated on …"), if any. */
  year?: number;
  notes?: string;
};

export type InstructionDef = {
  title: string;
  text: string;
  source: string;
  type?: 'ACTION' | 'OBSERVATION' | 'PRECAUTION' | 'TIP' | 'DECISION';
  safety?: { level: SafetyLevel; info: string };
};

export type StageDef = {
  /** Stage type code (seeded StageType), optional label only. */
  type?: string;
  title: string;
  description?: string;
  startDay?: number;
  endDay?: number;
  anchor?: StageDayAnchor;
  continuous?: boolean;
  instructions: InstructionDef[];
  resources?: { type: StageResourceType; name: string; description?: string }[];
  mistakes?: { title: string; consequence?: string; prevention?: string; source: string }[];
};

export type CropContent = {
  cropSlug: string;
  /** Short, factual description shown on the crop page. */
  description?: string;
  sources: Record<string, SourceDef>;
  requirements?: {
    parameter: string;
    min?: number;
    max?: number;
    unit?: string;
    level?: QualitativeLevel;
    importance?: RequirementImportance;
    notes?: string;
    source: string;
  }[];
  soils?: { soilType: string; suitability: Exclude<SuitabilityLevel, 'UNKNOWN'>; notes?: string; source: string }[];
  guide: {
    slug: string;
    name: string;
    description: string;
    method?: string;
    /** Bump when the content changes: a new procedure version is published, the old one superseded. */
    version: number;
    changeSummary: string;
    source: string;
    stages: StageDef[];
  };
  /** Draft kn/hi names for guide and stage titles (status DRAFT, pending native-speaker review). */
  translations?: { kn?: { guide?: string; stages?: string[] }; hi?: { guide?: string; stages?: string[] } };
};

/** Shared caution added to every chemical-control step. */
export const CHEMICAL_CAUTION =
  'Chemical options and doses are listed in the source. Before using any pesticide, herbicide or fungicide, confirm the product, dose and safety instructions with your local KVK or agriculture officer and follow the product label.';

export const REGION_NOTE =
  'Based on Tamil Nadu Agricultural University (TNAU) recommendations. Practices and doses can differ for your district in Karnataka — confirm with your nearest KVK or Raitha Samparka Kendra. Source-cited; pending expert review.';
