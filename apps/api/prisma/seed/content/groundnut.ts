/**
 * Groundnut — irrigated. Source: TNAU Agritech Portal, Crop Production :: Oil Seeds :: Groundnut.
 * Source-cited; pending expert review. No fungicide/herbicide doses (see CHEMICAL_CAUTION).
 * The page's NPK blanket-recommendation table did not extract cleanly, so no NPK dose is entered.
 */
import { CHEMICAL_CAUTION, REGION_NOTE, type CropContent } from './types.ts';

export const groundnut: CropContent = {
  cropSlug: 'groundnut',
  description:
    'Groundnut sown on beds at 30 × 10 cm. Flowering, pegging and pod development need enough soil moisture, and gypsum at 40–45 days helps pod formation (TNAU). Source-cited; pending expert review.',
  sources: {
    gn: {
      title: 'Crop Production — Oil Seeds — Groundnut',
      url: 'https://agritech.tnau.ac.in/agriculture/CropProduction/Oilseeds/oilseeds_groundnut01.html',
      organization: 'Tamil Nadu Agricultural University (TNAU) — Agritech Portal',
    },
  },
  seasons: [
    { season: 'KHARIF', startMonth: 6, endMonth: 8, notes: 'Tamil Nadu rainfed seasons: Early Adipattam (Jun–Jul) and Late Adipattam (Jul–Aug). Season class assigned by KrishiSutra from the source months.', source: 'gn' },
    { season: 'RABI', startMonth: 12, endMonth: 1, notes: 'Tamil Nadu irrigated season: Margazhipattam (Dec–Jan). Season class assigned by KrishiSutra from the source months.', source: 'gn' },
    { season: 'ZAID', startMonth: 2, endMonth: 5, notes: 'Tamil Nadu seasons: Masipattam (Feb–Mar, irrigated) and Chithiraipattam (Apr–May). Season class assigned by KrishiSutra from the source months.', source: 'gn' },
  ],
  guide: {
    slug: 'irrigated-groundnut-tnau',
    name: 'Irrigated groundnut',
    description: `Field preparation, seed treatment, sowing, weeding, earthing up with gypsum, irrigation, harvest and drying for irrigated groundnut. ${REGION_NOTE}`,
    method: 'DIRECT_SEEDED',
    version: 1,
    changeSummary: 'First source-cited version from the TNAU groundnut crop production page.',
    source: 'gn',
    stages: [
      {
        type: 'LAND_PREPARATION',
        title: 'Field preparation',
        instructions: [
          { title: 'Ploughing', text: 'Plough with a tractor-drawn disc followed by a harrow, or once or twice with an iron plough, or 3–4 times with a country plough, until all clods are broken and the soil has a fine tilth.', source: 'gn' },
          { title: 'Hard pan', text: 'If the soil has a hard pan at shallow depth, chisel at 0.5 m intervals in one direction and then across, once in three years. Also apply 12.5 t/ha of FYM or composted coir pith.', source: 'gn', type: 'TIP' },
          { title: 'Surface crusting', text: 'To overcome surface crusting, apply lime at 2 t/ha with FYM or composted coir pith at 12.5 t/ha.', source: 'gn', type: 'TIP' },
          { title: 'Fertilizer', text: 'Apply NPK fertilizers as per the soil test recommendation. If the soil is not tested, follow the blanket recommendation in the source or ask your Raitha Samparka Kendra.', source: 'gn' },
          { title: 'Beds', text: 'Form beds of 10–20 m² depending on water availability, land slope and soil type.', source: 'gn' },
        ],
      },
      {
        type: 'SEED_SELECTION_TREATMENT',
        title: 'Seed treatment',
        instructions: [
          { title: 'Seed rate', text: 'Use 125 kg/ha of kernels. Increase the seed rate by 15% for bold-seeded varieties.', source: 'gn' },
          { title: 'Biocontrol treatment', text: 'Treat the seeds with Trichoderma viride 4 g/kg or Pseudomonas fluorescens 10 g/kg of seed, just before sowing. Seeds treated with Trichoderma must not be treated with fungicides.', source: 'gn' },
          { title: 'Rhizobium', text: 'After the biocontrol agent, treat the seeds with 3 packets (600 g)/ha of Rhizobium culture using rice kanji as binder. If seeds are not treated, apply 10 packets/ha (2000 g) with 25 kg FYM and 25 kg soil before sowing.', source: 'gn' },
          { title: 'Fungicide seed treatment', text: CHEMICAL_CAUTION, source: 'gn', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
        ],
        resources: [{ type: 'INPUT', name: 'Trichoderma viride or Pseudomonas fluorescens; Rhizobium culture' }],
      },
      {
        type: 'SOWING',
        title: 'Sowing',
        startDay: 0, endDay: 0, anchor: 'SOWING',
        instructions: [
          { title: 'Spacing', text: 'Adopt 30 cm between rows and 10 cm between plants. Where groundnut ring mosaic (bud necrosis) is common, use 15 × 15 cm.', source: 'gn' },
          { title: 'Depth', text: 'Dibble the seeds 4 cm deep along with the fertilizer.', source: 'gn' },
          { title: 'Micronutrient mixture', text: 'Mix 12.5 kg/ha of the micronutrient mixture (Department of Agriculture formulation) with dry sand to make 50 kg/ha and broadcast evenly on the soil surface immediately after sowing. Do not mix it into the soil.', source: 'gn' },
          { title: 'Irrigation', text: 'Give the sowing irrigation, and a life irrigation 4–5 days after sowing.', source: 'gn' },
        ],
      },
      {
        type: 'WEED_MANAGEMENT',
        title: 'Weed management',
        startDay: 20, endDay: 40, anchor: 'SOWING',
        instructions: [
          { title: 'Hand hoeing and weeding', text: 'If no herbicide is applied, give two hand hoeings and weedings on the 20th and 40th day after sowing.', source: 'gn' },
          { title: 'Herbicides', text: CHEMICAL_CAUTION, source: 'gn', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
        ],
      },
      {
        type: 'VEGETATIVE_GROWTH',
        title: 'Earthing up and gypsum',
        startDay: 40, endDay: 45, anchor: 'SOWING',
        instructions: [
          { title: 'Gypsum', text: 'Apply gypsum at 400 kg/ha by the side of the plants on the 40th to 45th day after sowing. Hoe it into the soil and then earth up. Gypsum encourages pod formation and better pod filling.', source: 'gn' },
          { title: 'When to avoid gypsum', text: 'Avoid gypsum in calciferous soils. It is effective in soils deficient in calcium and sulphur.', source: 'gn', type: 'PRECAUTION' },
          { title: 'Earthing up', text: 'Earth up during the second hand weeding. Earthing up gives a medium for the pegs to develop. A long-handled hoe can be worked standing.', source: 'gn' },
        ],
        mistakes: [
          { title: 'Disturbing the soil after day 45', consequence: 'Pod formation is affected.', prevention: 'Finish hoeing and earthing up by the 45th day after sowing.', source: 'gn' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Irrigation',
        startDay: 0, endDay: 105, anchor: 'SOWING', continuous: true,
        instructions: [
          { title: 'Growth phases', text: 'Pre-flowering: days 1–25. Flowering: days 26–60. Maturity: days 61–105.', source: 'gn', type: 'OBSERVATION' },
          { title: 'Schedule', text: 'Irrigate 20 days after sowing; give two irrigations at flowering, one or two at pegging, and 2–3 during pod development depending on the soil type.', source: 'gn' },
          { title: 'Critical stages', text: 'Pegging, flowering and pod development are critical: keep enough soil moisture during these phases.', source: 'gn', type: 'PRECAUTION' },
          { title: 'Save water', text: 'Sprinkler irrigation saves about 30% of water.', source: 'gn', type: 'TIP' },
        ],
      },
      {
        type: 'HARVESTING',
        title: 'Maturity and harvesting',
        instructions: [
          { title: 'Signs of maturity', text: 'Older leaves dry and fall and the top leaves turn yellow. Pull out a few plants at random and shell the pods: if the inner shell is brownish black and not white, the crop is mature.', source: 'gn', type: 'DECISION' },
          { title: 'Irrigate before harvest', text: 'If the soil is dry, irrigate before harvest to make pulling easier. If there is no water, work a mould board or country plough to uproot the plants.', source: 'gn' },
        ],
        mistakes: [
          { title: 'Heaping wet plants', consequence: 'Pods start sprouting, especially in bunch varieties.', prevention: 'Do not keep pulled plants in heaps while they are wet.', source: 'gn' },
        ],
      },
      {
        type: 'POST_HARVEST',
        title: 'Drying and storage',
        instructions: [
          { title: 'Strip the pods', text: 'Strip the pods from the plants (a groundnut stripper can be used).', source: 'gn' },
          { title: 'Sun drying', text: 'Dry the pods in the sun for 4 or 5 days. After 2 or 3 days, dry again for 2 or 3 more days to make sure they are fully dry. When the temperature is very high, avoid direct sun drying.', source: 'gn' },
          { title: 'Storage', text: 'Store the pods in gunny bags on the ground over a layer of sand so moisture does not reach them.', source: 'gn' },
        ],
      },
    ],
  },
  translations: { kn: { guide: 'ನೀರಾವರಿ ಶೇಂಗಾ' }, hi: { guide: 'सिंचित मूंगफली' } },
};
