import type { LText } from '../i18n/types';

export type Option = { id: string; name: LText; icon?: string; color?: string };

export const SOIL_TYPES: Option[] = [
  { id: 'red', color: '#B5452F', name: { en: 'Red soil', kn: 'ಕೆಂಪು ಮಣ್ಣು', hi: 'लाल मिट्टी' } },
  { id: 'black', color: '#2F2A26', name: { en: 'Black soil', kn: 'ಕಪ್ಪು ಮಣ್ಣು', hi: 'काली मिट्टी' } },
  { id: 'sandy', color: '#D9B77A', name: { en: 'Sandy soil', kn: 'ಮರಳು ಮಣ್ಣು', hi: 'रेतीली मिट्टी' } },
  { id: 'clay', color: '#8A6A55', name: { en: 'Clay soil', kn: 'ಜೇಡಿ ಮಣ್ಣು', hi: 'चिकनी मिट्टी' } },
  { id: 'loamy', color: '#6B4B32', name: { en: 'Loamy soil', kn: 'ಗೋಡು ಮಣ್ಣು', hi: 'दोमट मिट्टी' } },
  { id: 'alluvial', color: '#A89176', name: { en: 'Alluvial soil', kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು', hi: 'जलोढ़ मिट्टी' } },
  { id: 'laterite', color: '#9C4A2A', name: { en: 'Laterite soil', kn: 'ಜಂಬಿಟ್ಟಿಗೆ ಮಣ್ಣು', hi: 'लेटराइट मिट्टी' } },
  { id: 'unknown', color: '#BDBDBD', name: { en: "I don't know", kn: 'ಗೊತ್ತಿಲ್ಲ', hi: 'पता नहीं' } },
];

export const WATER_SOURCES: Option[] = [
  { id: 'borewell', icon: '🛢️', name: { en: 'Borewell', kn: 'ಕೊಳವೆ ಬಾವಿ', hi: 'बोरवेल' } },
  { id: 'openwell', icon: '🪣', name: { en: 'Open well', kn: 'ತೆರೆದ ಬಾವಿ', hi: 'खुला कुआँ' } },
  { id: 'river', icon: '🏞️', name: { en: 'River', kn: 'ನದಿ', hi: 'नदी' } },
  { id: 'canal', icon: '🚰', name: { en: 'Canal', kn: 'ಕಾಲುವೆ', hi: 'नहर' } },
  { id: 'tank', icon: '💧', name: { en: 'Tank / pond', kn: 'ಕೆರೆ / ಹೊಂಡ', hi: 'तालाब' } },
  { id: 'rainfed', icon: '🌧️', name: { en: 'Rain only', kn: 'ಮಳೆಯಾಶ್ರಿತ', hi: 'केवल बारिश' } },
];

export const SEASONS: Option[] = [
  { id: 'kharif', icon: '🌧️', name: { en: 'Kharif (monsoon)', kn: 'ಮುಂಗಾರು', hi: 'खरीफ़ (बरसात)' } },
  { id: 'rabi', icon: '❄️', name: { en: 'Rabi (winter)', kn: 'ಹಿಂಗಾರು', hi: 'रबी (सर्दी)' } },
  { id: 'summer', icon: '☀️', name: { en: 'Summer', kn: 'ಬೇಸಿಗೆ', hi: 'ज़ायद (गर्मी)' } },
];

/** Soil test parameters. Labels only; no target ranges are given in the prototype. */
export const SOIL_TEST_FIELDS: { id: string; label: string; unit: string }[] = [
  { id: 'ph', label: 'pH', unit: '' },
  { id: 'n', label: 'N', unit: 'kg/ha' },
  { id: 'p', label: 'P', unit: 'kg/ha' },
  { id: 'k', label: 'K', unit: 'kg/ha' },
  { id: 'oc', label: 'OC', unit: '%' },
];
