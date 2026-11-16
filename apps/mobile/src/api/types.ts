/** Response shapes of the KrishiSutra API (apps/api). Keep in sync with the services there. */

export type Trust = 'VERIFIED' | 'SOURCE_CITED' | 'UNVERIFIED';
export type Source = { id: string; title: string; organization: string | null; year?: number | null; url: string | null; type?: string } | null;

export type CategoryNode = {
  slug: string;
  name: string;
  description: string | null;
  iconName: string | null;
  cropCount: number;
  totalCropCount: number;
  children: CategoryNode[];
};

export type CropSummary = {
  slug: string;
  name: string;
  scientificName: string | null;
  imageUrl: string | null;
  categories: { slug: string; name: string; isPrimary: boolean }[];
  guideCount: number;
};

export type CropDetail = {
  slug: string;
  name: string;
  scientificName: string | null;
  description: string | null;
  categories: { slug: string; name: string; isPrimary: boolean }[];
  varieties: { slug: string; name: string; description: string | null; isHybrid: boolean; trust: Trust; source: Source }[];
  seasons: { code: string; name: string; region: string | null; sowingStartMonth: number | null; sowingEndMonth: number | null; notes: string | null; trust: Trust; source: Source }[];
  soils: { code: string; name: string; suitability: string; notes: string | null; trust: Trust; source: Source }[];
  requirements: {
    parameter: string; name: string; min: number | null; max: number | null; unit: string | null; level: string | null;
    importance: string; notes: string | null; trust: Trust; source: Source;
  }[];
  guides: {
    id: string; name: string; description: string | null; isDefault: boolean; method: { code: string; name: string } | null;
    version: number; stageCount: number; trust: Trust;
  }[];
};

export type Instruction = {
  sequence: number;
  type: 'ACTION' | 'OBSERVATION' | 'PRECAUTION' | 'TIP' | 'DECISION';
  title: string;
  description: string;
  duration: string | null;
  safetyLevel: 'NONE' | 'CAUTION' | 'WARNING' | 'DANGER';
  safetyInfo: string | null;
  source: Source;
};

export type Stage = {
  id: string;
  sequence: number;
  type: string | null;
  icon: string | null;
  title: string;
  description: string | null;
  startDay: number | null;
  endDay: number | null;
  dayAnchor: 'PROCEDURE_START' | 'SOWING' | 'TRANSPLANTING' | 'PLANTING';
  isContinuous: boolean;
  instructions: Instruction[];
  resources: { type: string; name: string; description: string | null }[];
  mistakes: { title: string; consequence: string | null; prevention: string | null; source: Source }[];
  media: { type: string; title: string; url: string; thumbnailUrl: string | null; attribution: string | null }[];
};

export type Procedure = {
  id: string;
  name: string;
  description: string | null;
  crop: { slug: string; name: string };
  method: string | null;
  version: number;
  trust: Trust;
  source: Source;
  stages: Stage[];
};

export type Weather = {
  location: { latitude: number; longitude: number };
  current: { time: string; temperatureC: number | null; relativeHumidityPct: number | null; precipitationMm: number | null; windSpeedKmph: number | null; condition: string };
  daily: { date: string; temperatureMinC: number | null; temperatureMaxC: number | null; precipitationMm: number | null; precipitationProbabilityPct: number | null; condition: string }[];
  source: { provider: string; url: string; attribution: string };
  fetchedAt: string;
  stale: boolean;
};

export type Plot = { id: string; name: string; area: number; areaUnit: string; areaUnitSymbol: string; soilType: string | null; irrigationMethod: string | null };
export type FarmSummary = { id: string; name: string; village: string | null; district: string | null; state: string | null; latitude: number | null; longitude: number | null; plotCount: number };
export type Farm = FarmSummary & {
  taluk: string | null;
  plots: Plot[];
  waterSources: { id: string; name: string | null; type: string; availability: string }[];
};

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'SKIPPED';
export type FarmCropSummary = {
  id: string;
  label: string | null;
  status: string;
  crop: { slug: string; name: string };
  plot: { id: string; name: string };
  farm: { id: string; name: string };
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  tasks: { total: number; done: number; overdue: number; nextDueDate: string | null };
};
export type FarmCrop = {
  id: string;
  label: string | null;
  status: string;
  crop: { slug: string; name: string };
  guide: { procedureId: string; version: number | null } | null;
  plot: { id: string; name: string };
  farm: { id: string; name: string };
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  cultivatedArea: number;
  areaUnitSymbol: string;
  tasks: { id: string; title: string; status: TaskStatus; isCustom: boolean; stageId: string | null; startDate: string | null; dueDate: string | null }[];
  expenses: { id: string; category: string; date: string; amount: number; description: string | null }[];
  harvests: { id: string; number: number; date: string; quantity: number; unitSymbol: string }[];
  totals: { currency: string; expenses: number; revenue: number; balance: number };
};

export type ReasonResult = 'SUITABLE' | 'CAUTION' | 'UNSUITABLE' | 'UNKNOWN';
export type Recommendation = {
  id: string;
  ruleSetVersion: string;
  explanation: string;
  dataCompletenessPct: number | null;
  missingInputs: string[];
  items: {
    id: string;
    rank: number;
    suitability: 'HIGHLY_SUITABLE' | 'SUITABLE' | 'MODERATELY_SUITABLE' | 'NOT_SUITABLE' | 'UNKNOWN';
    crop: { slug: string; name: string };
    investment: { min: number | null; max: number | null; currency: string; areaAcres: number | null } | null;
    reasons: { kind: string; criterion: string; result: ReasonResult; code: string; message: string; observed: string | null; required: string | null; source: Source }[];
  }[];
};
