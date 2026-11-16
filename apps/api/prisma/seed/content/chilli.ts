/**
 * Chilli — transplanted. Source: TNAU Agritech Portal, Horticulture :: Vegetables :: Chilli
 * (cultural practices Oct 2022; manuring and harvest pages Jun 2023).
 * Source-cited; pending expert review. No herbicide/pesticide doses (see CHEMICAL_CAUTION).
 * Nursery details were not on the fetched pages; only the transplanting age (40–45 days) is cited.
 */
import { CHEMICAL_CAUTION, REGION_NOTE, type CropContent } from './types.ts';

const ORG = 'Tamil Nadu Agricultural University (TNAU) — Agritech Portal (Horticulture)';

export const chilli: CropContent = {
  cropSlug: 'chilli',
  description:
    'Chilli is transplanted at 40–45 days on ridges, irrigated weekly, and picked from 75 days after transplanting — the first two pickings give green chilli, later pickings red ripe fruit (TNAU). Source-cited; pending expert review.',
  sources: {
    cultural: { title: 'Chilli — Cultural practices', url: 'https://agritech.tnau.ac.in/horticulture/horti_vegetables_chilli_cultural.html', organization: ORG, year: 2022 },
    manuring: { title: 'Chilli — Manuring', url: 'https://agritech.tnau.ac.in/horticulture/horti_vegetables_chilli_Manuring.html', organization: ORG, year: 2023 },
    harvest: { title: 'Chilli — Harvest and yield', url: 'https://agritech.tnau.ac.in/horticulture/horti_vegetables_chilli_Yield_new.html', organization: ORG, year: 2023 },
  },
  guide: {
    slug: 'transplanted-chilli-tnau',
    name: 'Chilli (transplanted)',
    description: `Field preparation, manuring, transplanting, weeding, irrigation, top dressing and harvest for chilli. ${REGION_NOTE}`,
    method: 'TRANSPLANTED',
    version: 1,
    changeSummary: 'First source-cited version from TNAU chilli pages (2022–2023).',
    source: 'cultural',
    stages: [
      {
        type: 'LAND_PREPARATION',
        title: 'Field preparation and basal manuring',
        instructions: [
          { title: 'Prepare the field', text: 'Prepare the field thoroughly, adding FYM at 25 t/ha, and form ridges and furrows at 60 cm spacing.', source: 'cultural' },
          { title: 'Biofertilizers', text: 'Apply 2 kg/ha of Azospirillum and 2 kg/ha of Phosphobacteria mixed with 20 kg of FYM.', source: 'cultural' },
          { title: 'Basal dose — varieties', text: 'FYM 25 t/ha and NPK 30:60:30 kg/ha.', source: 'manuring' },
          { title: 'Basal dose — hybrids', text: 'FYM 30 t/ha and NPK 30:80:80 kg/ha.', source: 'manuring' },
          { title: 'Potassium source', text: 'Giving potassium as potassium sulphate improves the quality of chilli.', source: 'manuring', type: 'TIP' },
        ],
      },
      {
        type: 'TRANSPLANTING',
        title: 'Transplanting',
        startDay: 0, endDay: 7, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Transplant', text: 'Irrigate the furrows and transplant 40–45-day-old seedlings with the ball of earth, on the ridges.', source: 'cultural' },
          { title: 'Spacing', text: 'Varieties: 60 × 45 cm. Hybrids: 75 × 60 cm.', source: 'cultural' },
          { title: 'Gap filling', text: 'Fill gaps on the 7th day after transplanting.', source: 'cultural' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Irrigation',
        startDay: 0, anchor: 'TRANSPLANTING', continuous: true,
        instructions: [
          { title: 'Furrow irrigation', text: 'Irrigate at weekly intervals.', source: 'cultural' },
          { title: 'Drip irrigation (option)', text: 'Place lateral tubes 1.5 m apart at the centre of raised beds 120 cm wide (30 cm between beds), with drippers every 60 cm (4 LPH) or 50 cm (3.5 LPH). Wet the beds with the drip system for 8–12 hours before planting, and plant at 90 × 60 × 45 cm in paired rows.', source: 'cultural', type: 'TIP' },
        ],
      },
      {
        type: 'WEED_MANAGEMENT',
        title: 'Weed management',
        startDay: 0, endDay: 30, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Hand weeding', text: 'Hand weed once, 30 days after planting.', source: 'cultural' },
          { title: 'Herbicides', text: CHEMICAL_CAUTION, source: 'cultural', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Top dressing',
        startDay: 30, endDay: 90, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Nitrogen top dressing', text: 'Apply 30 kg N/ha in equal splits on the 30th, 60th and 90th day after planting (varieties and hybrids).', source: 'manuring' },
        ],
      },
      {
        type: 'HARVESTING',
        title: 'Harvesting',
        startDay: 75, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Start of harvest', text: 'Harvesting can start 75 days after transplanting. The first two pickings give green chilli; later pickings give red ripe fruit.', source: 'harvest' },
          { title: 'Dry chilli quality', text: 'Good dry chilli is well dried (12% moisture), big, bright red without white chillies, and uniform in size.', source: 'harvest', type: 'OBSERVATION' },
        ],
      },
    ],
  },
  translations: { kn: { guide: 'ಮೆಣಸಿನಕಾಯಿ (ನಾಟಿ)' }, hi: { guide: 'मिर्च (रोपाई)' } },
};
