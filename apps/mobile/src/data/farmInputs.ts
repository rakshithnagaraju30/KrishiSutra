import type { LText } from '../i18n/types';

/** `id` is the API code (soil type, water source type or season code). */
export type Option = { id: string; name: LText; icon?: string; color?: string };

export const SOIL_TYPES: Option[] = [
  { id: 'RED', color: '#B5452F', name: { en: 'Red soil', kn: 'ಕೆಂಪು ಮಣ್ಣು', hi: 'लाल मिट्टी' } },
  { id: 'BLACK', color: '#2F2A26', name: { en: 'Black soil', kn: 'ಕಪ್ಪು ಮಣ್ಣು', hi: 'काली मिट्टी' } },
  { id: 'SANDY', color: '#D9B77A', name: { en: 'Sandy soil', kn: 'ಮರಳು ಮಣ್ಣು', hi: 'रेतीली मिट्टी' } },
  { id: 'CLAY', color: '#8A6A55', name: { en: 'Clay soil', kn: 'ಜೇಡಿ ಮಣ್ಣು', hi: 'चिकनी मिट्टी' } },
  { id: 'LOAMY', color: '#6B4B32', name: { en: 'Loamy soil', kn: 'ಗೋಡು ಮಣ್ಣು', hi: 'दोमट मिट्टी' } },
  { id: 'ALLUVIAL', color: '#A89176', name: { en: 'Alluvial soil', kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು', hi: 'जलोढ़ मिट्टी' } },
  { id: 'LATERITE', color: '#9C4A2A', name: { en: 'Laterite soil', kn: 'ಜಂಬಿಟ್ಟಿಗೆ ಮಣ್ಣು', hi: 'लेटराइट मिट्टी' } },
  { id: 'UNKNOWN', color: '#BDBDBD', name: { en: "I don't know", kn: 'ಗೊತ್ತಿಲ್ಲ', hi: 'पता नहीं' } },
];

export const WATER_SOURCES: Option[] = [
  { id: 'BOREWELL', icon: '🛢️', name: { en: 'Borewell', kn: 'ಕೊಳವೆ ಬಾವಿ', hi: 'बोरवेल' } },
  { id: 'OPEN_WELL', icon: '🪣', name: { en: 'Open well', kn: 'ತೆರೆದ ಬಾವಿ', hi: 'खुला कुआँ' } },
  { id: 'RIVER', icon: '🏞️', name: { en: 'River', kn: 'ನದಿ', hi: 'नदी' } },
  { id: 'CANAL', icon: '🚰', name: { en: 'Canal', kn: 'ಕಾಲುವೆ', hi: 'नहर' } },
  { id: 'TANK_POND', icon: '💧', name: { en: 'Tank / pond', kn: 'ಕೆರೆ / ಹೊಂಡ', hi: 'तालाब' } },
  { id: 'RAINWATER', icon: '🌧️', name: { en: 'Rain only', kn: 'ಮಳೆಯಾಶ್ರಿತ', hi: 'केवल बारिश' } },
];

export const SEASONS: Option[] = [
  { id: 'KHARIF', icon: '🌧️', name: { en: 'Kharif (monsoon)', kn: 'ಮುಂಗಾರು', hi: 'खरीफ़ (बरसात)' } },
  { id: 'RABI', icon: '❄️', name: { en: 'Rabi (winter)', kn: 'ಹಿಂಗಾರು', hi: 'रबी (सर्दी)' } },
  { id: 'ZAID', icon: '☀️', name: { en: 'Summer', kn: 'ಬೇಸಿಗೆ', hi: 'ज़ायद (गर्मी)' } },
];

/** Soil test values the farmer can type in, with the API parameter and unit codes. */
export const SOIL_TEST_FIELDS: { id: string; label: string; unit: string; parameter: string; unitCode: string }[] = [
  { id: 'ph', label: 'pH', unit: '', parameter: 'SOIL_PH', unitCode: 'PH' },
  { id: 'n', label: 'N', unit: 'kg/ha', parameter: 'SOIL_AVAILABLE_N', unitCode: 'KG_PER_HECTARE' },
  { id: 'p', label: 'P', unit: 'kg/ha', parameter: 'SOIL_AVAILABLE_P', unitCode: 'KG_PER_HECTARE' },
  { id: 'k', label: 'K', unit: 'kg/ha', parameter: 'SOIL_AVAILABLE_K', unitCode: 'KG_PER_HECTARE' },
  { id: 'oc', label: 'OC', unit: '%', parameter: 'SOIL_ORGANIC_CARBON', unitCode: 'PERCENT' },
];

export const AREA_UNITS = [
  { id: 'ACRE', key: 'acre' },
  { id: 'GUNTA', key: 'gunta' },
] as const;

export const EXPENSE_CATEGORIES: Option[] = [
  { id: 'SEEDS', icon: '🫘', name: { en: 'Seeds', kn: 'ಬೀಜ', hi: 'बीज' } },
  { id: 'FERTILIZER', icon: '🧪', name: { en: 'Fertilizer', kn: 'ರಸಗೊಬ್ಬರ', hi: 'उर्वरक' } },
  { id: 'ORGANIC_MANURE', icon: '🐄', name: { en: 'Manure / FYM', kn: 'ಸಗಣಿ ಗೊಬ್ಬರ', hi: 'गोबर खाद' } },
  { id: 'PEST_CONTROL', icon: '🐛', name: { en: 'Plant protection', kn: 'ಸಸ್ಯ ಸಂರಕ್ಷಣೆ', hi: 'पौध संरक्षण' } },
  { id: 'LABOUR', icon: '👩‍🌾', name: { en: 'Labour', kn: 'ಕೂಲಿ', hi: 'मज़दूरी' } },
  { id: 'IRRIGATION', icon: '💧', name: { en: 'Irrigation', kn: 'ನೀರಾವರಿ', hi: 'सिंचाई' } },
  { id: 'MACHINERY', icon: '🚜', name: { en: 'Machinery', kn: 'ಯಂತ್ರ', hi: 'मशीन' } },
  { id: 'TRANSPORT', icon: '🚚', name: { en: 'Transport', kn: 'ಸಾಗಣೆ', hi: 'ढुलाई' } },
  { id: 'OTHER', icon: '📦', name: { en: 'Other', kn: 'ಇತರೆ', hi: 'अन्य' } },
];

export const HARVEST_UNITS = [
  { id: 'KILOGRAM', label: 'kg' },
  { id: 'QUINTAL', label: 'quintal' },
  { id: 'TONNE', label: 'tonne' },
] as const;
