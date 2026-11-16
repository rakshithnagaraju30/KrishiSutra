/**
 * Onion (Bellary / big onion) — transplanted. Source: TNAU Agritech Portal, Horticulture :: Vegetables ::
 * Bellary onion (updated 26.08.2013). Source-cited; pending expert review.
 * No pesticide/fungicide/growth-regulator doses (see CHEMICAL_CAUTION).
 */
import { CHEMICAL_CAUTION, REGION_NOTE, type CropContent } from './types.ts';

export const onion: CropContent = {
  cropSlug: 'onion',
  description:
    'Bellary (big) onion prefers well-drained red loam to black soils with pH 5.8–6.5 and a mild season; May–June is the best planting season (TNAU). Source-cited; pending expert review.',
  sources: {
    onion: {
      title: 'Bellary onion',
      url: 'https://agritech.tnau.ac.in/horticulture/horti_vegetables_bellaryonion.html',
      organization: 'Tamil Nadu Agricultural University (TNAU) — Agritech Portal (Horticulture)',
      year: 2013,
      notes: 'Page shows "Updated on : 26.08.2013". Text cited from the public page; pending expert review.',
    },
  },
  requirements: [
    { parameter: 'SOIL_PH', min: 5.8, max: 6.5, unit: 'PH', importance: 'PREFERRED', notes: 'The pH of 5.8–6.5 with mild season is preferred.', source: 'onion' },
    { parameter: 'GROWING_DURATION', min: 140, max: 150, unit: 'DAY', importance: 'PREFERRED', notes: 'Source: "The crop yields about 15–18 t/ha in 140–150 days." Harvest is 75–160 days depending on variety (fertigation section).', source: 'onion' },
  ],
  soils: [
    { soilType: 'RED', suitability: 'SUITABLE', notes: 'Red loam to black soils with good drainage are highly preferred.', source: 'onion' },
    { soilType: 'BLACK', suitability: 'SUITABLE', notes: 'Red loam to black soils with good drainage are highly preferred.', source: 'onion' },
  ],
  seasons: [
    { season: 'KHARIF', startMonth: 5, endMonth: 6, notes: 'May–June is the best season for planting. Season class assigned by KrishiSutra from the source months.', source: 'onion' },
  ],
  guide: {
    slug: 'bellary-onion-tnau',
    name: 'Bellary onion (transplanted)',
    description: `Nursery, field preparation, planting, irrigation, weeding, top dressing, harvest and curing for Bellary (big) onion. ${REGION_NOTE}`,
    method: 'TRANSPLANTED',
    version: 1,
    changeSummary: 'First source-cited version from the TNAU Bellary onion page.',
    source: 'onion',
    stages: [
      {
        type: 'NURSERY',
        title: 'Nursery',
        description: 'Day numbers count from nursery sowing. Seedlings are planted at 45 days.',
        startDay: 0, endDay: 45, anchor: 'SOWING',
        instructions: [
          { title: 'Seed rate', text: '10 kg of seed is required for a hectare.', source: 'onion' },
          { title: 'Nursery area and beds', text: 'A nursery of 12.5 cents with a 2% slope is needed to raise seedlings for 1 ha. Form raised beds 30 cm high with 30 cm between beds. Inoculate the beds with arbuscular mycorrhizae at 1 kg per square metre.', source: 'onion' },
          { title: 'Seed treatment', text: 'Treat the seeds with Pseudomonas fluorescens at 10 g per kg of seed.', source: 'onion' },
          { title: 'Sowing', text: 'Onion seeds are small: mix them with fine sand and sow in lines 10 cm apart. Cover with a thin layer of sand and then paddy straw. Water with a rose can twice a day.', source: 'onion' },
          { title: 'Damping off', text: CHEMICAL_CAUTION, source: 'onion', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
        ],
      },
      {
        type: 'LAND_PREPARATION',
        title: 'Field preparation and basal manuring',
        instructions: [
          { title: 'Ploughing and FYM', text: 'Plough the land to a fine tilth and incorporate 25 t/ha of FYM at the last ploughing.', source: 'onion' },
          { title: 'Ridges and furrows', text: 'Form ridges and furrows at 45 cm spacing.', source: 'onion' },
          { title: 'Basal fertilizer', text: 'Apply Azospirillum 2 kg and Phosphobacteria 2 kg/ha, and N 50 kg, P 150 kg and K 75 kg/ha as basal dose.', source: 'onion' },
          { title: 'Zinc', text: 'Apply zinc sulphate at 50 kg/ha as basal dose at the last ploughing.', source: 'onion' },
        ],
      },
      {
        type: 'TRANSPLANTING',
        title: 'Planting',
        startDay: 0, endDay: 0, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Plant', text: 'Plant 45-day-old seedlings 10 cm apart on both sides of the ridges.', source: 'onion' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Irrigation',
        startDay: 0, anchor: 'TRANSPLANTING', continuous: true,
        instructions: [
          { title: 'Weekly irrigation', text: 'After establishment, irrigate at weekly intervals.', source: 'onion' },
          { title: 'Drip irrigation (option)', text: 'With drip, lateral tubes are placed 1.5 m apart with drippers every 60 cm (4 LPH) or 50 cm (3.5 LPH). Raised beds are 1.2 m wide and 30 cm high, and seedlings are planted in 7 rows per bed, 15 cm between rows and 10 cm between plants. After planting, run the drip 1–2 hours per day depending on soil and weather.', source: 'onion', type: 'TIP' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Weeding and top dressing',
        startDay: 30, endDay: 30, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Top dressing', text: 'Top-dress N 50 kg/ha at 30 days after planting.', source: 'onion' },
          { title: 'Weeding', text: 'Do the first weeding on the 30th day after transplanting, then weed as and when necessary.', source: 'onion' },
        ],
      },
      {
        type: 'PEST_DISEASE_MANAGEMENT',
        title: 'Plant protection',
        continuous: true,
        instructions: [
          { title: 'Watch for these problems', text: 'The source lists thrips, onion fly, cutworm and nematodes as pests, and leaf spot as a disease, of Bellary onion.', source: 'onion', type: 'OBSERVATION' },
          { title: 'Chemical control', text: CHEMICAL_CAUTION, source: 'onion', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
        ],
      },
      {
        type: 'HARVESTING',
        title: 'Harvesting',
        instructions: [
          { title: 'Stop irrigation', text: 'Stop irrigation a week before harvesting.', source: 'onion' },
          { title: 'When to harvest', text: 'Harvest when 75% of the leaves have dried off (top fall stage).', source: 'onion', type: 'DECISION' },
        ],
      },
      {
        type: 'POST_HARVEST',
        title: 'Curing and storage',
        instructions: [
          { title: 'Cure in shade', text: 'After lifting, cure the bulbs with their tops in shade for 10–15 days before storage to remove field heat. Then sort and grade.', source: 'onion' },
          { title: 'Grades', text: 'Extra large: more than 6 cm diameter; medium: 4–6 cm; small: 2–4 cm.', source: 'onion', type: 'OBSERVATION' },
        ],
      },
    ],
  },
  translations: { kn: { guide: 'ಬಳ್ಳಾರಿ ಈರುಳ್ಳಿ (ನಾಟಿ)' }, hi: { guide: 'बेल्लारी प्याज (रोपाई)' } },
};
