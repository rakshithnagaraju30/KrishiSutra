/**
 * Presentation only: emoji and colours for crops, categories and stages.
 * All crop knowledge (names, guides, requirements) comes from the API.
 */

const CROP_LOOK: Record<string, { icon: string; color: string }> = {
  rice: { icon: '🌾', color: '#E8F3D6' },
  maize: { icon: '🌽', color: '#FFF4CC' },
  tomato: { icon: '🍅', color: '#FDE2DE' },
  chilli: { icon: '🌶️', color: '#FBE0DC' },
  groundnut: { icon: '🥜', color: '#F3E6D3' },
  onion: { icon: '🧅', color: '#F1E0F0' },
  cotton: { icon: '☁️', color: '#EEF2F5' },
  mango: { icon: '🥭', color: '#FFE9C7' },
  marigold: { icon: '🌼', color: '#FFF1C2' },
};

export function cropLook(slug: string | undefined) {
  return (slug && CROP_LOOK[slug]) || { icon: '🌱', color: '#E3F2E5' };
}

const CATEGORY_ICONS: Record<string, string> = {
  'food-crops': '🌾', cereals: '🌾', millets: '🌾', pulses: '🫘',
  'commercial-cash-crops': '💰', 'fibre-crops': '☁️', 'sugar-crops': '🎋',
  'flower-crops': '🌼', 'loose-flowers': '🌼', 'cut-flowers': '🌹',
  'vegetable-crops': '🥬', 'solanaceous-vegetables': '🍅', 'bulb-vegetables': '🧅', 'leafy-vegetables': '🥬',
  'fruit-crops': '🥭', 'tropical-fruits': '🥭',
  'oilseed-crops': '🌻', 'spice-crops': '🌶️', 'plantation-crops': '🌴',
  'medicinal-aromatic-crops': '🌿', 'medicinal-plants': '🌿', 'aromatic-plants': '🌿',
  'fodder-crops': '🐄',
};

export function categoryIcon(slug: string | undefined) {
  return (slug && CATEGORY_ICONS[slug]) || '🌱';
}

const STAGE_ICONS: Record<string, string> = {
  LAND_PREPARATION: '🚜', SEED_SELECTION_TREATMENT: '🫘', NURSERY: '🌱', SOWING: '✋', TRANSPLANTING: '🌿',
  VEGETATIVE_GROWTH: '🪴', IRRIGATION_NUTRIENT: '💧', WEED_MANAGEMENT: '🌾', FLOWERING: '🌼', FRUIT_DEVELOPMENT: '🍅',
  PEST_DISEASE_MANAGEMENT: '🐛', HARVESTING: '🧺', POST_HARVEST: '🏠',
};

export function stageIcon(type: string | null | undefined) {
  return (type && STAGE_ICONS[type]) || '📋';
}

export const WEATHER_ICONS: Record<string, string> = {
  CLEAR: '☀️', PARTLY_CLOUDY: '⛅', CLOUDY: '☁️', FOG: '🌫️', DRIZZLE: '🌦️', RAIN: '🌧️', SHOWERS: '🌦️', THUNDERSTORM: '⛈️', SNOW: '❄️', UNKNOWN: '🌡️',
};
