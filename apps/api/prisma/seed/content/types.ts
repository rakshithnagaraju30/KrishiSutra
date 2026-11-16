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
  /** Sowing / planting seasons exactly as the source states them (months 1–12; may wrap, e.g. 12 → 1). */
  seasons?: { season: 'KHARIF' | 'RABI' | 'ZAID' | 'PERENNIAL'; startMonth?: number; endMonth?: number; region?: 'Karnataka'; notes: string; source: string }[];
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

/**
 * Draft Kannada / Hindi titles for stage names (status DRAFT — pending native-speaker review).
 * Used automatically for any stage whose English title is listed here.
 */
export const STAGE_TITLE_TRANSLATIONS: Record<string, { kn: string; hi: string }> = {
  'Main field preparation': { kn: 'ಮುಖ್ಯ ಜಮೀನಿನ ಸಿದ್ಧತೆ', hi: 'मुख्य खेत की तैयारी' },
  'Field preparation': { kn: 'ಭೂಮಿ ಸಿದ್ಧತೆ', hi: 'खेत की तैयारी' },
  'Field preparation and basal manuring': { kn: 'ಭೂಮಿ ಸಿದ್ಧತೆ ಮತ್ತು ತಳಗೊಬ್ಬರ', hi: 'खेत की तैयारी और आधार खाद' },
  Nursery: { kn: 'ಸಸಿಮಡಿ', hi: 'नर्सरी' },
  Transplanting: { kn: 'ನಾಟಿ', hi: 'रोपाई' },
  Planting: { kn: 'ನಾಟಿ', hi: 'रोपण' },
  'Water management': { kn: 'ನೀರು ನಿರ್ವಹಣೆ', hi: 'जल प्रबंधन' },
  Irrigation: { kn: 'ನೀರಾವರಿ', hi: 'सिंचाई' },
  'Nutrient management': { kn: 'ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ', hi: 'पोषक तत्व प्रबंधन' },
  'Basal fertilizer': { kn: 'ತಳಗೊಬ್ಬರ', hi: 'आधार उर्वरक' },
  'Weed management': { kn: 'ಕಳೆ ನಿರ್ವಹಣೆ', hi: 'खरपतवार प्रबंधन' },
  'Seed and sowing': { kn: 'ಬೀಜ ಮತ್ತು ಬಿತ್ತನೆ', hi: 'बीज और बुवाई' },
  'Seed treatment': { kn: 'ಬೀಜೋಪಚಾರ', hi: 'बीज उपचार' },
  Sowing: { kn: 'ಬಿತ್ತನೆ', hi: 'बुवाई' },
  'Thinning and gap filling': { kn: 'ಸಸಿ ವಿರಳಗೊಳಿಸುವಿಕೆ ಮತ್ತು ಖಾಲಿ ಜಾಗ ತುಂಬುವುದು', hi: 'छंटाई और खाली जगह भरना' },
  'Top dressing': { kn: 'ಮೇಲುಗೊಬ್ಬರ', hi: 'टॉप ड्रेसिंग (ऊपरी खाद)' },
  'Top dressing and earthing up': { kn: 'ಮೇಲುಗೊಬ್ಬರ ಮತ್ತು ಮಣ್ಣು ಏರಿಸುವುದು', hi: 'टॉप ड्रेसिंग और मिट्टी चढ़ाना' },
  'Hoeing, weeding and earthing up': { kn: 'ಕುಂಟೆ, ಕಳೆ ತೆಗೆಯುವುದು ಮತ್ತು ಮಣ್ಣು ಏರಿಸುವುದು', hi: 'गुड़ाई, निराई और मिट्टी चढ़ाना' },
  'Earthing up and gypsum': { kn: 'ಮಣ್ಣು ಏರಿಸುವುದು ಮತ್ತು ಜಿಪ್ಸಂ', hi: 'मिट्टी चढ़ाना और जिप्सम' },
  'Weeding and top dressing': { kn: 'ಕಳೆ ತೆಗೆಯುವುದು ಮತ್ತು ಮೇಲುಗೊಬ್ಬರ', hi: 'निराई और टॉप ड्रेसिंग' },
  'Mulching and weed control': { kn: 'ಹೊದಿಕೆ ಮತ್ತು ಕಳೆ ನಿಯಂತ್ರಣ', hi: 'मल्चिंग और खरपतवार नियंत्रण' },
  'Staking and training': { kn: 'ಕೋಲು ಆಸರೆ ಮತ್ತು ತರಬೇತಿ', hi: 'सहारा देना और प्रशिक्षण' },
  'Micronutrient sprays': { kn: 'ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶ ಸಿಂಪಡಣೆ', hi: 'सूक्ष्म पोषक तत्व छिड़काव' },
  'Plant protection': { kn: 'ಸಸ್ಯ ಸಂರಕ್ಷಣೆ', hi: 'पौध संरक्षण' },
  Harvesting: { kn: 'ಕೊಯ್ಲು', hi: 'कटाई' },
  'Maturity and harvesting': { kn: 'ಬಲಿಯುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು', hi: 'परिपक्वता और कटाई' },
  'Threshing, drying and storage': { kn: 'ಒಕ್ಕಣೆ, ಒಣಗಿಸುವಿಕೆ ಮತ್ತು ಸಂಗ್ರಹಣೆ', hi: 'गहाई, सुखाना और भंडारण' },
  'Drying and storage': { kn: 'ಒಣಗಿಸುವಿಕೆ ಮತ್ತು ಸಂಗ್ರಹಣೆ', hi: 'सुखाना और भंडारण' },
  'Curing and storage': { kn: 'ಕ್ಯೂರಿಂಗ್ ಮತ್ತು ಸಂಗ್ರಹಣೆ', hi: 'क्योरिंग और भंडारण' },
};
