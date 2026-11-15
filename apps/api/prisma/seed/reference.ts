/**
 * Reference data: roles, languages, units, regions, soil types, seasons, parameters,
 * water source types, stage types, cultivation methods, and the demonstration content source.
 *
 * Only definitions and standard unit conversions are seeded here — no agronomic values.
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { ParameterCategory, UnitDimension } from '../../generated/prisma/enums.ts';

export const ROLES = [
  { code: 'FARMER', name: 'Farmer', description: 'Grows crops; owns farms, plots and cultivation records.' },
  { code: 'AGRI_EXPERT', name: 'Agricultural expert', description: 'Reviews and verifies agricultural content and diagnoses.' },
  { code: 'CONTENT_EDITOR', name: 'Content editor', description: 'Authors crop knowledge and translations.' },
  { code: 'ADMIN', name: 'Administrator', description: 'Manages users, roles and reference data.' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', isDefault: true, displayOrder: 1 },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', isDefault: false, displayOrder: 2 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', isDefault: false, displayOrder: 3 },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', isDefault: false, displayOrder: 4 },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', isDefault: false, displayOrder: 5 },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', isDefault: false, displayOrder: 6 },
];

/** toBaseFactor: m² for AREA, kg for MASS, L for VOLUME, m for LENGTH, s for TIME. Exact definitions. */
type UnitSeed = { code: string; name: string; symbol: string; dimension: UnitDimension; toBaseFactor: string | null; isLocal?: boolean };
export const UNITS: UnitSeed[] = [
  // Area (1 acre = 4046.8564224 m²; 1 acre = 40 gunta = 100 cent)
  { code: 'SQUARE_METRE', name: 'Square metre', symbol: 'm²', dimension: 'AREA', toBaseFactor: '1' },
  { code: 'HECTARE', name: 'Hectare', symbol: 'ha', dimension: 'AREA', toBaseFactor: '10000' },
  { code: 'ACRE', name: 'Acre', symbol: 'ac', dimension: 'AREA', toBaseFactor: '4046.8564224' },
  { code: 'GUNTA', name: 'Gunta', symbol: 'gunta', dimension: 'AREA', toBaseFactor: '101.17141056', isLocal: true },
  { code: 'CENT', name: 'Cent', symbol: 'cent', dimension: 'AREA', toBaseFactor: '40.468564224', isLocal: true },
  // Mass
  { code: 'GRAM', name: 'Gram', symbol: 'g', dimension: 'MASS', toBaseFactor: '0.001' },
  { code: 'KILOGRAM', name: 'Kilogram', symbol: 'kg', dimension: 'MASS', toBaseFactor: '1' },
  { code: 'QUINTAL', name: 'Quintal', symbol: 'q', dimension: 'MASS', toBaseFactor: '100' },
  { code: 'TONNE', name: 'Tonne', symbol: 't', dimension: 'MASS', toBaseFactor: '1000' },
  // Volume
  { code: 'MILLILITRE', name: 'Millilitre', symbol: 'mL', dimension: 'VOLUME', toBaseFactor: '0.001' },
  { code: 'LITRE', name: 'Litre', symbol: 'L', dimension: 'VOLUME', toBaseFactor: '1' },
  // Length
  { code: 'MILLIMETRE', name: 'Millimetre', symbol: 'mm', dimension: 'LENGTH', toBaseFactor: '0.001' },
  { code: 'CENTIMETRE', name: 'Centimetre', symbol: 'cm', dimension: 'LENGTH', toBaseFactor: '0.01' },
  { code: 'METRE', name: 'Metre', symbol: 'm', dimension: 'LENGTH', toBaseFactor: '1' },
  // Time
  { code: 'MINUTE', name: 'Minute', symbol: 'min', dimension: 'TIME', toBaseFactor: '60' },
  { code: 'HOUR', name: 'Hour', symbol: 'h', dimension: 'TIME', toBaseFactor: '3600' },
  { code: 'DAY', name: 'Day', symbol: 'd', dimension: 'TIME', toBaseFactor: '86400' },
  { code: 'WEEK', name: 'Week', symbol: 'wk', dimension: 'TIME', toBaseFactor: '604800' },
  // Non-linear / dimensionless
  { code: 'DEGREE_CELSIUS', name: 'Degree Celsius', symbol: '°C', dimension: 'TEMPERATURE', toBaseFactor: null },
  { code: 'PERCENT', name: 'Percent', symbol: '%', dimension: 'RATIO', toBaseFactor: null },
  { code: 'PH', name: 'pH unit', symbol: 'pH', dimension: 'OTHER', toBaseFactor: null },
  { code: 'DECISIEMENS_PER_METRE', name: 'Decisiemens per metre', symbol: 'dS/m', dimension: 'CONCENTRATION', toBaseFactor: null },
  { code: 'PPM', name: 'Parts per million (mg/kg)', symbol: 'ppm', dimension: 'CONCENTRATION', toBaseFactor: null },
  { code: 'KG_PER_HECTARE', name: 'Kilogram per hectare', symbol: 'kg/ha', dimension: 'RATE', toBaseFactor: null },
  { code: 'LITRE_PER_HOUR', name: 'Litre per hour', symbol: 'L/h', dimension: 'RATE', toBaseFactor: null },
  { code: 'COUNT', name: 'Count', symbol: 'no.', dimension: 'COUNT', toBaseFactor: '1' },
];

export const SOIL_TYPES = [
  { code: 'RED', name: 'Red soil', colorHex: '#B5452F' },
  { code: 'BLACK', name: 'Black soil', colorHex: '#2F2A26' },
  { code: 'SANDY', name: 'Sandy soil', colorHex: '#D9B77A' },
  { code: 'CLAY', name: 'Clay soil', colorHex: '#8A6A55' },
  { code: 'LOAMY', name: 'Loamy soil', colorHex: '#6B4B32' },
  { code: 'ALLUVIAL', name: 'Alluvial soil', colorHex: '#A89176' },
  { code: 'LATERITE', name: 'Laterite soil', colorHex: '#9C4A2A' },
  { code: 'SALINE_ALKALINE', name: 'Saline / alkaline soil', colorHex: '#C9C2B5' },
];

/** Month bounds intentionally left empty until filled from a cited source. */
export const SEASONS = [
  { code: 'KHARIF', name: 'Kharif (monsoon)' },
  { code: 'RABI', name: 'Rabi (winter)' },
  { code: 'ZAID', name: 'Zaid (summer)' },
  { code: 'PERENNIAL', name: 'Perennial / year-round' },
];

type ParamSeed = { code: string; name: string; category: ParameterCategory; unit: string | null };
export const PARAMETERS: ParamSeed[] = [
  { code: 'SOIL_PH', name: 'Soil pH', category: 'SOIL', unit: 'PH' },
  { code: 'SOIL_EC', name: 'Electrical conductivity', category: 'SOIL', unit: 'DECISIEMENS_PER_METRE' },
  { code: 'SOIL_ORGANIC_CARBON', name: 'Organic carbon', category: 'SOIL', unit: 'PERCENT' },
  { code: 'SOIL_AVAILABLE_N', name: 'Available nitrogen (N)', category: 'NUTRIENT', unit: 'KG_PER_HECTARE' },
  { code: 'SOIL_AVAILABLE_P', name: 'Available phosphorus (P)', category: 'NUTRIENT', unit: 'KG_PER_HECTARE' },
  { code: 'SOIL_AVAILABLE_K', name: 'Available potassium (K)', category: 'NUTRIENT', unit: 'KG_PER_HECTARE' },
  { code: 'SOIL_AVAILABLE_S', name: 'Available sulphur (S)', category: 'NUTRIENT', unit: 'PPM' },
  { code: 'SOIL_ZN', name: 'Zinc (Zn)', category: 'NUTRIENT', unit: 'PPM' },
  { code: 'SOIL_FE', name: 'Iron (Fe)', category: 'NUTRIENT', unit: 'PPM' },
  { code: 'SOIL_MN', name: 'Manganese (Mn)', category: 'NUTRIENT', unit: 'PPM' },
  { code: 'SOIL_CU', name: 'Copper (Cu)', category: 'NUTRIENT', unit: 'PPM' },
  { code: 'SOIL_B', name: 'Boron (B)', category: 'NUTRIENT', unit: 'PPM' },
  { code: 'NUTRIENT_N', name: 'Nitrogen dose (N)', category: 'NUTRIENT', unit: 'KG_PER_HECTARE' },
  { code: 'NUTRIENT_P2O5', name: 'Phosphate dose (P₂O₅)', category: 'NUTRIENT', unit: 'KG_PER_HECTARE' },
  { code: 'NUTRIENT_K2O', name: 'Potash dose (K₂O)', category: 'NUTRIENT', unit: 'KG_PER_HECTARE' },
  { code: 'AIR_TEMPERATURE', name: 'Air temperature', category: 'CLIMATE', unit: 'DEGREE_CELSIUS' },
  { code: 'ANNUAL_RAINFALL', name: 'Annual rainfall', category: 'CLIMATE', unit: 'MILLIMETRE' },
  { code: 'RELATIVE_HUMIDITY', name: 'Relative humidity', category: 'CLIMATE', unit: 'PERCENT' },
  { code: 'CROP_WATER_REQUIREMENT', name: 'Crop water requirement', category: 'WATER', unit: 'MILLIMETRE' },
  { code: 'WATER_NEED', name: 'Water need (qualitative)', category: 'WATER', unit: null },
  { code: 'GROWING_DURATION', name: 'Growing duration', category: 'CROP', unit: 'DAY' },
];

export const WATER_SOURCE_TYPES = [
  { code: 'BOREWELL', name: 'Borewell' },
  { code: 'OPEN_WELL', name: 'Open well' },
  { code: 'RIVER', name: 'River' },
  { code: 'CANAL', name: 'Canal' },
  { code: 'TANK_POND', name: 'Tank / pond' },
  { code: 'RAINWATER', name: 'Rainwater only' },
  { code: 'OTHER', name: 'Other' },
];

export const STAGE_TYPES = [
  { code: 'LAND_PREPARATION', name: 'Land preparation', iconName: 'tractor' },
  { code: 'SEED_SELECTION_TREATMENT', name: 'Seed selection and treatment', iconName: 'seed' },
  { code: 'NURSERY', name: 'Nursery preparation', iconName: 'seedling' },
  { code: 'SOWING', name: 'Sowing', iconName: 'hand-seed' },
  { code: 'TRANSPLANTING', name: 'Transplanting', iconName: 'transplant' },
  { code: 'VEGETATIVE_GROWTH', name: 'Vegetative growth', iconName: 'leaf' },
  { code: 'IRRIGATION_NUTRIENT', name: 'Irrigation and nutrient management', iconName: 'water' },
  { code: 'WEED_MANAGEMENT', name: 'Weed management', iconName: 'weed' },
  { code: 'FLOWERING', name: 'Flowering', iconName: 'flower' },
  { code: 'FRUIT_DEVELOPMENT', name: 'Fruit development', iconName: 'fruit' },
  { code: 'PEST_DISEASE_MANAGEMENT', name: 'Disease and pest management', iconName: 'bug' },
  { code: 'HARVESTING', name: 'Harvesting', iconName: 'basket' },
  { code: 'POST_HARVEST', name: 'Post-harvest management', iconName: 'warehouse' },
];

export const CULTIVATION_METHODS = [
  { code: 'TRANSPLANTED', name: 'Transplanted' },
  { code: 'DIRECT_SEEDED', name: 'Direct seeded' },
  { code: 'OPEN_FIELD', name: 'Open field' },
  { code: 'PROTECTED_CULTIVATION', name: 'Protected cultivation (polyhouse / net house)' },
  { code: 'CONTAINER_HOME_GARDEN', name: 'Container / home garden' },
  { code: 'ORGANIC', name: 'Organic' },
];

export const DEMO_SOURCE_TITLE = 'KrishiSutra demonstration data (not verified)';

export async function seedReference(prisma: PrismaClient) {
  for (const r of ROLES) {
    await prisma.role.upsert({ where: { code: r.code }, update: { name: r.name, description: r.description }, create: r });
  }

  for (const l of LANGUAGES) {
    await prisma.language.upsert({ where: { code: l.code }, update: l, create: l });
  }

  // Regions: only country and state (names). District/taluk/village rows and LGD codes are imported
  // later from the official Local Government Directory dataset rather than typed by hand.
  let india = await prisma.region.findFirst({ where: { type: 'COUNTRY', name: 'India', parentId: null } });
  india ??= await prisma.region.create({ data: { type: 'COUNTRY', name: 'India' } });
  const karnataka = await prisma.region.upsert({
    where: { parentId_type_name: { parentId: india.id, type: 'STATE', name: 'Karnataka' } },
    update: {},
    create: { type: 'STATE', name: 'Karnataka', parentId: india.id },
  });

  for (const [i, u] of UNITS.entries()) {
    const data = {
      name: u.name,
      symbol: u.symbol,
      dimension: u.dimension,
      toBaseFactor: u.toBaseFactor,
      isLocal: u.isLocal ?? false,
      regionId: u.isLocal ? karnataka.id : null,
      displayOrder: i + 1,
    };
    await prisma.measurementUnit.upsert({ where: { code: u.code }, update: data, create: { code: u.code, ...data } });
  }
  const unitId = async (code: string) => (await prisma.measurementUnit.findUniqueOrThrow({ where: { code } })).id;

  for (const [i, s] of SOIL_TYPES.entries()) {
    await prisma.soilType.upsert({ where: { code: s.code }, update: { ...s, displayOrder: i + 1 }, create: { ...s, displayOrder: i + 1 } });
  }
  for (const [i, s] of SEASONS.entries()) {
    await prisma.season.upsert({ where: { code: s.code }, update: { ...s, displayOrder: i + 1 }, create: { ...s, displayOrder: i + 1 } });
  }
  for (const [i, p] of PARAMETERS.entries()) {
    const data = { name: p.name, category: p.category, defaultUnitId: p.unit ? await unitId(p.unit) : null, displayOrder: i + 1 };
    await prisma.agronomicParameter.upsert({ where: { code: p.code }, update: data, create: { code: p.code, ...data } });
  }
  for (const [i, w] of WATER_SOURCE_TYPES.entries()) {
    await prisma.waterSourceType.upsert({ where: { code: w.code }, update: { ...w, displayOrder: i + 1 }, create: { ...w, displayOrder: i + 1 } });
  }
  for (const [i, s] of STAGE_TYPES.entries()) {
    await prisma.stageType.upsert({ where: { code: s.code }, update: { ...s, displayOrder: i + 1 }, create: { ...s, displayOrder: i + 1 } });
  }
  for (const [i, m] of CULTIVATION_METHODS.entries()) {
    await prisma.cultivationMethod.upsert({ where: { code: m.code }, update: { ...m, displayOrder: i + 1 }, create: { ...m, displayOrder: i + 1 } });
  }

  const existingSource = await prisma.contentSource.findFirst({ where: { title: DEMO_SOURCE_TITLE } });
  existingSource ??
    (await prisma.contentSource.create({
      data: {
        sourceType: 'INTERNAL_DEMO',
        title: DEMO_SOURCE_TITLE,
        organization: 'KrishiSutra',
        licenseType: 'OWN_CONTENT',
        notes: 'Placeholder records for development and testing. Contains no agronomic recommendations.',
        regionId: karnataka.id,
      },
    }));
}
