/**
 * Maize — irrigated (hybrids). Source: TNAU Agritech Portal, "Irrigated Maize" (updated May 2023).
 * Source-cited; pending expert review. No herbicide doses (see CHEMICAL_CAUTION).
 */
import { CHEMICAL_CAUTION, REGION_NOTE, type CropContent } from './types.ts';

export const maize: CropContent = {
  cropSlug: 'maize',
  description:
    'Irrigated hybrid maize sown on ridges at 60 × 25 cm. Maize is sensitive to both moisture stress and excess moisture; the critical stage for water is 45–65 days after sowing (TNAU). Source-cited; pending expert review.',
  sources: {
    irrigated: {
      title: 'Irrigated Maize',
      url: 'https://agritech.tnau.ac.in/agriculture/agri_maize_irrigated_maize.html',
      organization: 'Tamil Nadu Agricultural University (TNAU) — Agritech Portal',
      year: 2023,
      notes: 'Page shows "Updated on May 2023". Text cited from the public page; pending expert review.',
    },
  },
  requirements: [
    { parameter: 'NUTRIENT_N', min: 250, max: 250, unit: 'KG_PER_HECTARE', importance: 'PREFERRED', notes: 'Fertilizer dose 250:75:75 kg N:P2O5:K2O per hectare (irrigated hybrid maize).', source: 'irrigated' },
    { parameter: 'NUTRIENT_P2O5', min: 75, max: 75, unit: 'KG_PER_HECTARE', importance: 'PREFERRED', notes: 'Fertilizer dose 250:75:75 kg N:P2O5:K2O per hectare (irrigated hybrid maize).', source: 'irrigated' },
    { parameter: 'NUTRIENT_K2O', min: 75, max: 75, unit: 'KG_PER_HECTARE', importance: 'PREFERRED', notes: 'Fertilizer dose 250:75:75 kg N:P2O5:K2O per hectare (irrigated hybrid maize).', source: 'irrigated' },
  ],
  guide: {
    slug: 'irrigated-maize-tnau',
    name: 'Irrigated maize (hybrids)',
    description: `Field preparation, fertilizer, sowing, weeding, earthing up, irrigation and harvest for irrigated hybrid maize. ${REGION_NOTE}`,
    method: 'DIRECT_SEEDED',
    version: 1,
    changeSummary: 'First source-cited version from the TNAU "Irrigated Maize" page (May 2023).',
    source: 'irrigated',
    stages: [
      {
        type: 'LAND_PREPARATION',
        title: 'Field preparation and basal manuring',
        instructions: [
          { title: 'Ploughing', text: 'Plough the field thoroughly once with a disc or mould board plough, then cross plough with a cultivator to get a fine tilth.', source: 'irrigated' },
          { title: 'Organic manure', text: 'Apply 12.5 t/ha of FYM or compost with 10 packets of Azospirillum (2000 g/ha) before the last ploughing.', source: 'irrigated' },
          { title: 'Biofertilizers', text: 'Mix 2 kg each of Azospirillum and Phosphobacteria (or Azophos) with 25 kg FYM and 25 kg sand and broadcast evenly at the last ploughing.', source: 'irrigated' },
          { title: 'Ridges and furrows', text: 'Form ridges and furrows 6 m long and 60 cm apart using a bund former or ridge plough.', source: 'irrigated' },
          { title: 'Boron', text: 'Where the soil is deficient in boron, apply 10 kg borax along with FYM.', source: 'irrigated', type: 'TIP' },
        ],
        resources: [
          { type: 'MACHINERY', name: 'Disc / mould board plough and cultivator' },
          { type: 'INPUT', name: 'FYM or compost (12.5 t/ha)' },
          { type: 'INPUT', name: 'Azospirillum, Phosphobacteria or Azophos' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Basal fertilizer',
        startDay: 0, endDay: 0, anchor: 'SOWING',
        instructions: [
          { title: 'Total dose', text: 'Fertilizer dose: 250:75:75 kg N:P2O5:K2O per hectare. Follow your soil test card where available.', source: 'irrigated', type: 'OBSERVATION' },
          { title: 'Before sowing', text: 'Apply a quarter of the nitrogen (136 kg urea/ha), the full phosphorus (469 kg single super phosphate/ha) and the full potash (125 kg muriate of potash/ha) as basal before sowing, in the furrows.', source: 'irrigated' },
        ],
        resources: [{ type: 'INPUT', name: 'Urea, single super phosphate, muriate of potash' }],
      },
      {
        type: 'SOWING',
        title: 'Seed and sowing',
        startDay: 0, endDay: 0, anchor: 'SOWING',
        instructions: [
          { title: 'Seed rate', text: 'Use 20 kg/ha of seed for maize hybrids (the source names COH(M) 6, COH(M) 8 and COH(M) 11).', source: 'irrigated' },
          { title: 'Seed treatment (biofertilizer)', text: 'Treat the seed for one hectare with 1 kg each of Azospirillum and Phosphobacteria (or Azophos) using rice gruel, and dry in shade for 30 minutes before sowing.', source: 'irrigated' },
          { title: 'Spacing and depth', text: 'Spacing 60 × 25 cm. Dibble the seeds 4 cm deep along the furrow where the fertilizer was placed and cover with soil.', source: 'irrigated' },
          { title: 'Seeds per hole', text: 'Put one seed per hole if germination is assured; otherwise put two seeds per hole.', source: 'irrigated', type: 'DECISION' },
          { title: 'Irrigate', text: 'Irrigate right after sowing, then give a life irrigation on the 4th day.', source: 'irrigated' },
        ],
      },
      {
        type: 'WEED_MANAGEMENT',
        title: 'Weed management',
        startDay: 3, endDay: 35, anchor: 'SOWING',
        instructions: [
          { title: 'Herbicides', text: CHEMICAL_CAUTION, source: 'irrigated', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
          { title: 'Hand weeding', text: 'Give one hand weeding 30–35 days after sowing.', source: 'irrigated' },
        ],
      },
      {
        type: 'VEGETATIVE_GROWTH',
        title: 'Thinning and gap filling',
        startDay: 12, endDay: 15, anchor: 'SOWING',
        instructions: [
          { title: 'Thinning', text: 'On 12–15 days after sowing keep one healthy seedling per hill and remove the others.', source: 'irrigated' },
          { title: 'Gap filling', text: 'Where there is a gap, dibble one pre-soaked seed per hole and irrigate immediately.', source: 'irrigated' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Top dressing and earthing up',
        startDay: 25, endDay: 45, anchor: 'SOWING',
        instructions: [
          { title: 'First top dressing (day 25)', text: 'Place half of the nitrogen (272 kg urea/ha) on the 25th day after sowing.', source: 'irrigated' },
          { title: 'Hoeing, weeding and earthing up (day 30)', text: 'Hoe and hand weed on the 30th day after sowing, then earth up for better anchorage.', source: 'irrigated' },
          { title: 'Second top dressing (day 45)', text: 'Apply the remaining quarter of the nitrogen (136 kg urea/ha) on the 45th day after sowing.', source: 'irrigated' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Irrigation',
        startDay: 0, endDay: 95, anchor: 'SOWING', continuous: true,
        instructions: [
          { title: 'Growth phases', text: 'Germination and establishment: days 1–14. Vegetative: days 15–39. Flowering: days 40–65. Maturity: days 66–95.', source: 'irrigated', type: 'OBSERVATION' },
          { title: 'Heavy soils', text: 'Irrigate after sowing, on day 4 (life irrigation) and day 12; vegetative phase on days 25 and 36; flowering (irrigate copiously) on days 48 and 60; maturity (control irrigation) on days 72 and 85.', source: 'irrigated' },
          { title: 'Light soils', text: 'Irrigate after sowing, on day 4 (life irrigation) and day 12; vegetative phase on days 22, 32 and 40; flowering (irrigate copiously) on days 50, 60 and 72; maturity (control irrigation) on days 85 and 95.', source: 'irrigated' },
          { title: 'Critical stage', text: 'Maize is sensitive to both moisture stress and excessive moisture. Make sure there is enough moisture during the critical stage, 45–65 days after sowing.', source: 'irrigated', type: 'PRECAUTION' },
        ],
      },
      {
        type: 'HARVESTING',
        title: 'Harvesting',
        instructions: [
          { title: 'When to harvest', text: 'The crop is ready when the cob sheath turns yellow and the seeds become hard and dry.', source: 'irrigated', type: 'DECISION' },
        ],
      },
      {
        type: 'POST_HARVEST',
        title: 'Threshing, drying and storage',
        instructions: [
          { title: 'Threshing', text: 'Use a mechanical thresher, or run a tractor over the dried cobs, to separate the grain.', source: 'irrigated' },
          { title: 'Storage', text: 'Clean the grain and store the dry grain in gunny bags.', source: 'irrigated' },
        ],
      },
    ],
  },
  translations: { kn: { guide: 'ನೀರಾವರಿ ಮೆಕ್ಕೆಜೋಳ (ಹೈಬ್ರಿಡ್)' }, hi: { guide: 'सिंचित मक्का (संकर)' } },
};
