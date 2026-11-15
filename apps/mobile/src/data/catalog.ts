import type { LText } from '../i18n/types';

/**
 * PROTOTYPE CATALOGUE
 *
 * This file only holds structure: category names, crop names and stage titles.
 * It deliberately contains NO agronomic facts (durations, doses, varieties, yields, costs).
 * Those will come from verified, source-cited content in the real knowledge base
 * (see docs/requirements §9 and docs/adr/0006).
 */

export type Category = {
  id: string;
  name: LText;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: 'food', icon: '🌾', name: { en: 'Food Crops', kn: 'ಆಹಾರ ಬೆಳೆಗಳು', hi: 'खाद्य फसलें' } },
  { id: 'vegetable', icon: '🥬', name: { en: 'Vegetable Crops', kn: 'ತರಕಾರಿ ಬೆಳೆಗಳು', hi: 'सब्ज़ी फसलें' } },
  { id: 'oilseed', icon: '🌻', name: { en: 'Oilseed Crops', kn: 'ಎಣ್ಣೆಕಾಳು ಬೆಳೆಗಳು', hi: 'तिलहन फसलें' } },
  { id: 'spice', icon: '🌶️', name: { en: 'Spice Crops', kn: 'ಸಾಂಬಾರ ಬೆಳೆಗಳು', hi: 'मसाला फसलें' } },
  { id: 'commercial', icon: '💰', name: { en: 'Commercial / Cash Crops', kn: 'ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು', hi: 'नकदी फसलें' } },
  { id: 'fodder', icon: '🐄', name: { en: 'Fodder Crops', kn: 'ಮೇವಿನ ಬೆಳೆಗಳು', hi: 'चारा फसलें' } },
  { id: 'fruit', icon: '🥭', name: { en: 'Fruit Crops', kn: 'ಹಣ್ಣಿನ ಬೆಳೆಗಳು', hi: 'फल फसलें' } },
  { id: 'flower', icon: '🌼', name: { en: 'Flower Crops', kn: 'ಹೂವಿನ ಬೆಳೆಗಳು', hi: 'फूलों की फसलें' } },
  { id: 'plantation', icon: '🌴', name: { en: 'Plantation Crops', kn: 'ತೋಟದ ಬೆಳೆಗಳು', hi: 'बागान फसलें' } },
  {
    id: 'medicinal',
    icon: '🌿',
    name: { en: 'Medicinal & Aromatic Crops', kn: 'ಔಷಧೀಯ ಮತ್ತು ಸುಗಂಧ ಬೆಳೆಗಳು', hi: 'औषधीय और सुगंधित फसलें' },
  },
];

export type StageId =
  | 'land'
  | 'seed'
  | 'nursery'
  | 'sowing'
  | 'transplant'
  | 'irrigation'
  | 'weed'
  | 'care'
  | 'flowerFruit'
  | 'flowerPod'
  | 'pest'
  | 'harvest'
  | 'postHarvest';

export type StageInfo = { title: LText; icon: string };

export const STAGES: Record<StageId, StageInfo> = {
  land: { icon: '🚜', title: { en: 'Land preparation', kn: 'ಭೂಮಿ ಸಿದ್ಧತೆ', hi: 'भूमि की तैयारी' } },
  seed: {
    icon: '🫘',
    title: { en: 'Seed selection & treatment', kn: 'ಬೀಜ ಆಯ್ಕೆ ಮತ್ತು ಬೀಜೋಪಚಾರ', hi: 'बीज चयन और बीज उपचार' },
  },
  nursery: { icon: '🌱', title: { en: 'Nursery raising', kn: 'ಸಸಿಮಡಿ ತಯಾರಿ', hi: 'नर्सरी तैयार करना' } },
  sowing: { icon: '✋', title: { en: 'Sowing', kn: 'ಬಿತ್ತನೆ', hi: 'बुवाई' } },
  transplant: { icon: '🌿', title: { en: 'Transplanting', kn: 'ನಾಟಿ', hi: 'रोपाई' } },
  irrigation: {
    icon: '💧',
    title: {
      en: 'Irrigation & nutrient management',
      kn: 'ನೀರಾವರಿ ಮತ್ತು ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ',
      hi: 'सिंचाई और पोषक तत्व प्रबंधन',
    },
  },
  weed: { icon: '🌾', title: { en: 'Weed management', kn: 'ಕಳೆ ನಿರ್ವಹಣೆ', hi: 'खरपतवार प्रबंधन' } },
  care: { icon: '🪴', title: { en: 'Crop care', kn: 'ಬೆಳೆ ಆರೈಕೆ', hi: 'फसल की देखभाल' } },
  flowerFruit: {
    icon: '🌼',
    title: {
      en: 'Flowering & fruit development',
      kn: 'ಹೂಬಿಡುವಿಕೆ ಮತ್ತು ಕಾಯಿ ಬೆಳವಣಿಗೆ',
      hi: 'फूल और फल विकास',
    },
  },
  flowerPod: {
    icon: '🌼',
    title: {
      en: 'Flowering & pod development',
      kn: 'ಹೂಬಿಡುವಿಕೆ ಮತ್ತು ಕಾಯಿ ಬೆಳವಣಿಗೆ',
      hi: 'फूल और फली विकास',
    },
  },
  pest: {
    icon: '🐛',
    title: { en: 'Pest & disease management', kn: 'ಕೀಟ ಮತ್ತು ರೋಗ ನಿರ್ವಹಣೆ', hi: 'कीट और रोग प्रबंधन' },
  },
  harvest: { icon: '🧺', title: { en: 'Harvesting', kn: 'ಕೊಯ್ಲು', hi: 'कटाई' } },
  postHarvest: {
    icon: '🏠',
    title: { en: 'Post-harvest management', kn: 'ಕೊಯ್ಲಿನ ನಂತರದ ನಿರ್ವಹಣೆ', hi: 'कटाई के बाद प्रबंधन' },
  },
};

export type Crop = {
  id: string;
  name: LText;
  icon: string;
  /** Background colour for the crop tile. */
  color: string;
  /** A crop can belong to several categories. */
  categoryIds: string[];
  /** Name of the growing method shown in the prototype. */
  method: LText;
  /** Ordered, crop-specific stages (not forced into one template). */
  stages: StageId[];
};

const TRANSPLANTED: LText = { en: 'Transplanted', kn: 'ನಾಟಿ ವಿಧಾನ', hi: 'रोपाई विधि' };
const DIRECT_SOWN: LText = { en: 'Direct sowing', kn: 'ನೇರ ಬಿತ್ತನೆ', hi: 'सीधी बुवाई' };

export const CROPS: Crop[] = [
  {
    id: 'paddy',
    icon: '🌾',
    color: '#E8F3D6',
    name: { en: 'Paddy (Rice)', kn: 'ಭತ್ತ', hi: 'धान (चावल)' },
    categoryIds: ['food'],
    method: TRANSPLANTED,
    stages: ['land', 'seed', 'nursery', 'transplant', 'irrigation', 'weed', 'pest', 'harvest', 'postHarvest'],
  },
  {
    id: 'maize',
    icon: '🌽',
    color: '#FFF4CC',
    name: { en: 'Maize', kn: 'ಮೆಕ್ಕೆಜೋಳ', hi: 'मक्का' },
    categoryIds: ['food', 'fodder'],
    method: DIRECT_SOWN,
    stages: ['land', 'seed', 'sowing', 'irrigation', 'weed', 'pest', 'harvest', 'postHarvest'],
  },
  {
    id: 'tomato',
    icon: '🍅',
    color: '#FDE2DE',
    name: { en: 'Tomato', kn: 'ಟೊಮೆಟೊ', hi: 'टमाटर' },
    categoryIds: ['vegetable'],
    method: TRANSPLANTED,
    stages: ['land', 'seed', 'nursery', 'transplant', 'irrigation', 'care', 'flowerFruit', 'pest', 'harvest', 'postHarvest'],
  },
  {
    id: 'chilli',
    icon: '🌶️',
    color: '#FBE0DC',
    name: { en: 'Chilli', kn: 'ಮೆಣಸಿನಕಾಯಿ', hi: 'मिर्च' },
    categoryIds: ['vegetable', 'spice'],
    method: TRANSPLANTED,
    stages: ['land', 'seed', 'nursery', 'transplant', 'irrigation', 'care', 'flowerFruit', 'pest', 'harvest', 'postHarvest'],
  },
  {
    id: 'groundnut',
    icon: '🥜',
    color: '#F3E6D3',
    name: { en: 'Groundnut', kn: 'ಶೇಂಗಾ (ಕಡಲೆಕಾಯಿ)', hi: 'मूंगफली' },
    categoryIds: ['oilseed', 'commercial'],
    method: DIRECT_SOWN,
    stages: ['land', 'seed', 'sowing', 'irrigation', 'weed', 'flowerPod', 'pest', 'harvest', 'postHarvest'],
  },
  {
    id: 'onion',
    icon: '🧅',
    color: '#F1E0F0',
    name: { en: 'Onion', kn: 'ಈರುಳ್ಳಿ', hi: 'प्याज' },
    categoryIds: ['vegetable'],
    method: TRANSPLANTED,
    stages: ['land', 'seed', 'nursery', 'transplant', 'irrigation', 'weed', 'pest', 'harvest', 'postHarvest'],
  },
];

export function getCrop(id: string | undefined): Crop | undefined {
  return CROPS.find((c) => c.id === id);
}

export function getCategory(id: string | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function cropsInCategory(categoryId: string): Crop[] {
  return CROPS.filter((c) => c.categoryIds.includes(categoryId));
}

/** Simple search across crop names in all languages. */
export function searchCrops(query: string): Crop[] {
  const q = query.trim().toLowerCase();
  if (!q) return CROPS;
  return CROPS.filter((c) => Object.values(c.name).some((n) => n.toLowerCase().includes(q)));
}
