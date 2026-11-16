/**
 * Tomato — transplanted, open field. Sources: TNAU Agritech Portal, Horticulture :: Vegetables :: Tomato
 * (pages updated Jun 2023) and the TNAU "Fertilizer schedule for vegetable crops" PDF.
 * Source-cited; pending expert review. No pesticide/fungicide/herbicide/fumigant doses (see CHEMICAL_CAUTION).
 * Harvest guidance was not on the fetched pages, so the harvest stage says so instead of guessing.
 */
import { CHEMICAL_CAUTION, REGION_NOTE, type CropContent } from './types.ts';

const ORG = 'Tamil Nadu Agricultural University (TNAU) — Agritech Portal (Horticulture)';

export const tomato: CropContent = {
  cropSlug: 'tomato',
  description:
    'Tomato grows best in well-drained loamy soils rich in organic matter with pH 6.5–7.5. Seedlings are raised in a nursery and transplanted at 25 days (TNAU). Source-cited; pending expert review.',
  sources: {
    soil: { title: 'Tomato — Soil, season and field preparation', url: 'https://agritech.tnau.ac.in/horticulture/horti_vegetables_tomato_Soil.html', organization: ORG, year: 2023 },
    nursery: { title: 'Tomato — Seed and nursery', url: 'http://www.agritech.tnau.ac.in/horticulture/horti_vegetables_tomato_seed.html', organization: ORG, year: 2023 },
    cultural: { title: 'Tomato — Cultural practices', url: 'https://agritech.tnau.ac.in/horticulture/horti_vegetables_tomato_cultural%20practices.html', organization: ORG, year: 2023 },
    fertilizer: { title: 'Fertilizer schedule for vegetable crops', url: 'https://agritech.tnau.ac.in/horticulture/FERTILIZER%20SCHEDULE%20FOR%20VEGETABLES.pdf', organization: ORG },
  },
  requirements: [
    { parameter: 'SOIL_PH', min: 6.5, max: 7.5, unit: 'PH', importance: 'PREFERRED', notes: 'Well drained loamy soils rich in organic matter with a pH range of 6.5–7.5.', source: 'soil' },
  ],
  soils: [
    { soilType: 'LOAMY', suitability: 'SUITABLE', notes: 'Well drained loamy soils rich in organic matter.', source: 'soil' },
  ],
  seasons: [
    { season: 'KHARIF', startMonth: 5, endMonth: 6, notes: 'Season of sowing May–June (Aadi pattam). Season class assigned by KrishiSutra from the source months.', source: 'soil' },
    { season: 'RABI', startMonth: 11, endMonth: 12, notes: 'Season of sowing November–December; the seed page lists December–January (Thai pattam). Season class assigned by KrishiSutra from the source months.', source: 'soil' },
  ],
  guide: {
    slug: 'transplanted-tomato-tnau',
    name: 'Tomato (transplanted)',
    description: `Nursery, field preparation, transplanting, mulching, fertilizer, staking and micronutrient sprays for tomato. ${REGION_NOTE}`,
    method: 'TRANSPLANTED',
    version: 1,
    changeSummary: 'First source-cited version from TNAU tomato pages (Jun 2023) and the TNAU vegetable fertilizer schedule.',
    source: 'cultural',
    stages: [
      {
        type: 'NURSERY',
        title: 'Nursery',
        description: 'Day numbers count from nursery sowing. Seedlings are transplanted at 25 days.',
        startDay: 0, endDay: 25, anchor: 'SOWING',
        instructions: [
          { title: 'Seed rate', text: 'Varieties: 300–350 g per hectare. Hybrids: 100–150 g per hectare.', source: 'nursery' },
          { title: 'Seed treatment', text: 'Treat the seeds with Trichoderma viride 4 g with a rice kanji coating (as written in the source). A fungicide treatment is also listed in the source — confirm with your KVK before using it.', source: 'nursery' },
          { title: 'Raised nursery beds', text: 'Make raised beds 10–15 cm high, 1 m wide and of convenient length, in fine, weed-free soil. Mix two parts fine red earth, one part sand and one part FYM into each bed. Solarizing the bed with a white polythene sheet also checks nematodes and weeds.', source: 'nursery' },
          { title: 'Sowing in the nursery', text: 'Sow in lines 10 cm apart, cover the seed with fine sand or powdered FYM, cover the beds with paddy straw and water with a rose can.', source: 'nursery' },
          { title: 'Pro-tray nursery (option)', text: 'For 1 ha, prepare 3 cents of nursery under 50% shade net with insect-proof nylon net on the sides. Mix 300 kg sterilized cocopeat with 5 kg neem cake and 1 kg each of Azospirillum and Phosphobacteria (about 1.2 kg cocopeat fills one tray). 238 pro-trays (98 cells) give 23,334 seedlings for one hectare at 90 × 60 × 60 cm paired rows. Sow one seed per cell, stack the trays and cover with polythene until germination; after six days place the trays on raised beds. Water with a rose can every day and drench with NPK 19:19:19 at 0.3% (3 g/l) 18 days after sowing.', source: 'nursery', type: 'TIP' },
          { title: 'Soil drenching and nursery chemicals', text: CHEMICAL_CAUTION, source: 'nursery', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
        ],
        resources: [
          { type: 'INPUT', name: 'Seed (300–350 g/ha varieties; 100–150 g/ha hybrids)' },
          { type: 'INPUT', name: 'Trichoderma viride' },
          { type: 'MATERIAL', name: 'Pro-trays, cocopeat, shade net (pro-tray option)' },
        ],
      },
      {
        type: 'LAND_PREPARATION',
        title: 'Field preparation and basal manuring',
        instructions: [
          { title: 'Ploughing and FYM', text: 'Plough the field to a fine tilth. Add FYM at 25 t/ha.', source: 'soil' },
          { title: 'Ridges or raised beds', text: 'Form ridges and furrows at 60 cm, or raised beds (90 × 60 × 60 cm).', source: 'soil' },
          { title: 'Biofertilizers', text: 'Apply 2 kg/ha of Azospirillum and 2 kg/ha of Phosphobacteria mixed with 50 kg of FYM.', source: 'soil' },
          { title: 'Basal fertilizer', text: 'Apply N 75 kg, P 100 kg, K 50 kg, borax 10 kg and zinc sulphate 50 kg per hectare as basal dose.', source: 'fertilizer' },
        ],
      },
      {
        type: 'TRANSPLANTING',
        title: 'Transplanting',
        startDay: 0, endDay: 3, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Transplant', text: 'Irrigate the field and transplant 25-day-old seedlings.', source: 'soil' },
          { title: 'Spacing', text: 'Varieties PKM 1, Paiyur 1, COTH 2 and TNAU Tomato Hybrid CO 3: 60 × 45 cm. Variety CO 3: 45 × 30 cm.', source: 'cultural' },
          { title: 'Life irrigation', text: 'Give a life irrigation on the 3rd day after planting.', source: 'soil' },
        ],
      },
      {
        type: 'WEED_MANAGEMENT',
        title: 'Mulching and weed control',
        startDay: 0, endDay: 30, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Plastic mulch', text: 'Mulch with black LDPE sheets of 25 micron thickness and bury both ends 10 cm into the soil.', source: 'cultural' },
          { title: 'Weed mat', text: 'A weed mat laid between the beds stops sunlight reaching weeds and reduces herbicide use. Weed mats are strong and can be reused.', source: 'cultural', type: 'TIP' },
          { title: 'Hand weeding', text: 'Hand weed once at 30 days after planting.', source: 'cultural' },
          { title: 'Herbicides', text: CHEMICAL_CAUTION, source: 'cultural', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
        ],
        resources: [{ type: 'MATERIAL', name: 'Black LDPE mulch sheet (25 micron) or weed mat' }],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Top dressing and earthing up',
        startDay: 30, endDay: 30, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Top dressing', text: 'Apply 75 kg N per hectare on the 30th day of planting, during earthing up.', source: 'fertilizer' },
        ],
      },
      {
        type: 'VEGETATIVE_GROWTH',
        title: 'Staking and training',
        startDay: 30, endDay: 30, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Staking (hybrids)', text: 'Stake the plants 30 days after planting with stakes 1–1.5 m tall. Staking helps spraying and harvest, reduces diseases such as buckeye rot, and improves fruit yield and quality.', source: 'cultural' },
          { title: 'Remove lower side branches', text: 'Remove the side branches up to 20 cm from ground level.', source: 'cultural' },
        ],
        resources: [{ type: 'MATERIAL', name: 'Stakes 1–1.5 m tall' }],
      },
      {
        type: 'FLOWERING',
        title: 'Micronutrient sprays',
        startDay: 40, endDay: 60, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Zinc', text: 'Spray ZnSO4 at 0.5% three times at 10-day intervals from 40 days after planting.', source: 'cultural' },
          { title: 'NPK and micronutrients', text: 'Spray 19:19:19 + micronutrients at 1% at 60 days after planting.', source: 'cultural' },
          { title: 'Boron', text: 'Spray boric acid 0.3% at flowering and again 10 days later.', source: 'cultural' },
        ],
      },
      {
        type: 'HARVESTING',
        title: 'Harvesting',
        description: 'Not available yet: harvest guidance from a cited source has not been added. Ask your KVK or horticulture officer.',
        instructions: [
          { title: 'Harvest guidance pending', text: 'Harvest stage and method are not included yet because they were not in the cited pages. Ask your nearest KVK or horticulture officer.', source: 'cultural', type: 'OBSERVATION' },
        ],
      },
    ],
  },
  translations: { kn: { guide: 'ಟೊಮೆಟೊ (ನಾಟಿ)' }, hi: { guide: 'टमाटर (रोपाई)' } },
};
