/**
 * Rice (paddy) — transplanted. Source: TNAU Rice Expert System (agritech.tnau.ac.in/expert_system/paddy).
 * Main-field steps use the page's "Main field preparation in Karnataka" and "In Karnataka" spacing sections.
 * Source-cited; pending expert review. No chemical pesticide/herbicide doses (see CHEMICAL_CAUTION).
 */
import { CHEMICAL_CAUTION, REGION_NOTE, type CropContent } from './types.ts';

const ORG = 'Tamil Nadu Agricultural University (TNAU) — Rice Expert System';
const BASE = 'http://www.agritech.tnau.ac.in/expert_system/paddy';

export const rice: CropContent = {
  cropSlug: 'rice',
  description:
    'Rice is a semi-aquatic crop that grows best under submerged conditions. Clay or clay-loam soils that hold water are most suited, and it grows well at soil pH 5.5–6.5 (TNAU Rice Expert System). Source-cited; pending expert review.',
  sources: {
    fieldPrep: { title: 'Cultivation Practices — Main field preparation', url: `${BASE}/cultivationpractices1.html`, organization: ORG },
    establishment: { title: 'Cultivation Practices — Crop stand establishment', url: `${BASE}/cultivationpractices2.html`, organization: ORG },
    water: { title: 'Cultivation Practices — Water management', url: `${BASE}/cultivationpractices3.html`, organization: ORG },
    weeds: { title: 'Cultivation Practices — Weed management', url: `${BASE}/cultivationpractices4.html`, organization: ORG },
    nursery: { title: 'Nursery Management', url: `${BASE}/nurserymgmt.html`, organization: ORG },
    nutrient: { title: 'Nutrient Management', url: `${BASE}/nutrientmanagement.html`, organization: ORG },
    harvest: { title: 'Post Harvest Technology', url: `${BASE}/phtc.html`, organization: ORG },
    seasons: { title: 'Season and Varieties', url: `${BASE}/seasonvariety.html`, organization: ORG },
    irrigation: {
      title: 'Irrigation Management — Transplanted puddled lowland rice',
      url: 'https://agritech.tnau.ac.in/agriculture/agri_irrigationmgt_rice_transplantedpuddled.html',
      organization: 'Tamil Nadu Agricultural University (TNAU) — Agritech Portal',
    },
  },
  requirements: [
    { parameter: 'SOIL_PH', min: 5.5, max: 6.5, unit: 'PH', importance: 'PREFERRED', notes: 'Source: "It grows well in soils having a pH range between 5.5 and 6.5." Rice is also cultivated in almost all soil types with varying productivity.', source: 'fieldPrep' },
    { parameter: 'CROP_WATER_REQUIREMENT', min: 1100, max: 1250, unit: 'MILLIMETRE', importance: 'PREFERRED', notes: 'Total water 1100–1250 mm depending on agro-climatic situation, variety duration and soil (average 1100 mm; SRI average 700 mm).', source: 'water' },
    { parameter: 'WATER_NEED', level: 'HIGH', importance: 'PREFERRED', notes: 'Semi-aquatic crop that grows best under submerged conditions.', source: 'fieldPrep' },
  ],
  soils: [
    { soilType: 'CLAY', suitability: 'SUITABLE', notes: 'Clay or clay loams are most suited: they hold water for long and sustain the crop.', source: 'fieldPrep' },
  ],
  seasons: [
    { season: 'KHARIF', region: 'Karnataka', notes: 'Kharif is listed for Karnataka, with varieties by agro-climatic zone (see source).', source: 'seasons' },
    { season: 'ZAID', region: 'Karnataka', notes: 'Listed as "Summer" for Karnataka, with varieties by agro-climatic zone (see source).', source: 'seasons' },
    { season: 'RABI', region: 'Karnataka', notes: 'Rabi is listed for Karnataka, with varieties by agro-climatic zone (see source).', source: 'seasons' },
  ],
  guide: {
    slug: 'transplanted-rice-tnau',
    name: 'Transplanted rice (paddy)',
    description: `Nursery, main field, transplanting, water, nutrients, weeds, harvest and storage for transplanted rice. ${REGION_NOTE}`,
    method: 'TRANSPLANTED',
    version: 1,
    changeSummary: 'First source-cited version from the TNAU Rice Expert System (Karnataka main-field practices where available).',
    source: 'establishment',
    stages: [
      {
        type: 'NURSERY',
        title: 'Nursery',
        description: 'Raise healthy seedlings in a wet nursery near the water source. Day numbers count from nursery sowing.',
        startDay: 0, endDay: 35, anchor: 'SOWING',
        instructions: [
          { title: 'Nursery area', text: 'Select 20 cents (800 m²) of land near the water source to transplant one hectare (conventional method). For SRI, 100 m² per hectare (1 cent per acre) is enough.', source: 'nursery' },
          { title: 'Seed rate', text: 'Conventional method: 30 kg for long-duration, 40 kg for medium-duration and 60 kg for short-duration varieties, 20 kg for hybrids. SRI: 7–8 kg/ha.', source: 'nursery' },
          { title: 'Pick good seed with salt water', text: 'Put 10 litres of water in a bucket and drop in a fresh egg. Add common salt little by little until the top of the egg shows above the water. Add 10 kg of seed, remove the seeds that float, and wash the seeds that sink 2–3 times in water before use.', source: 'nursery', type: 'TIP' },
          { title: 'Biological seed treatment', text: 'Treat seed with Pseudomonas fluorescens 10 g/kg and soak in 1 litre of water overnight. Drain the extra water, keep the seed for 24 hours to sprout, then sow. Biocontrol agents can be mixed with biofertilizers, but not with fungicides.', source: 'nursery' },
          { title: 'Fungicide seed treatment', text: CHEMICAL_CAUTION, source: 'nursery', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
          { title: 'Prepare the beds', text: 'Dry plough twice and apply 1 tonne of FYM or compost to the 20-cent nursery. Irrigate and keep wet for two days, then puddle twice; repeat puddling after one week. After levelling make beds 8–10 m long and 2.5 m wide with 30–50 cm channels between beds. Sow the sprouted seed evenly.', source: 'nursery' },
          { title: 'Basal fertilizer for the nursery', text: 'In less fertile nursery soils, when seedlings are to be pulled out 20–25 days after sowing, apply DAP 40 kg as basal; if DAP is not available, apply 16 kg urea and 120 kg super phosphate.', source: 'nursery' },
          { title: 'Water in the nursery', text: 'Drain the water 18–24 hours after sowing. From the 3rd to 5th day keep the soil just saturated. From the 5th day raise the water to 1.5 cm according to seedling height, and then keep 2.5 cm of water.', source: 'nursery' },
          { title: 'Pests in the nursery', text: 'For armyworm, flood the nursery so hiding larvae come up and birds pick them, or let ducks into the field. For thrips, submerge the seedlings for 1–2 days at intervals, or drag a wet cloth over the seedlings. Chemical options are in the source: confirm with your KVK before use.', source: 'nursery', type: 'TIP' },
          { title: 'When to pull seedlings', text: 'Pull out seedlings at 25 days for short-duration, 30 days for medium-duration and 35 days for long-duration varieties (14 days for SRI). If the nursery soil is heavy clay, apply 20 kg gypsum a day before pulling.', source: 'nursery', type: 'DECISION' },
        ],
        resources: [
          { type: 'INPUT', name: 'Seed (variety recommended for your area)' },
          { type: 'INPUT', name: 'FYM or compost (1 tonne for 20 cents)' },
          { type: 'MATERIAL', name: 'Bucket, common salt and a fresh egg (seed test)' },
        ],
        mistakes: [
          { title: 'Planting aged seedlings', consequence: 'Transplanting after the 5th leaf stage affects crop performance and grain yield.', prevention: 'Pull seedlings at the 4th leaf stage.', source: 'establishment' },
        ],
      },
      {
        type: 'LAND_PREPARATION',
        title: 'Main field preparation',
        description: 'Karnataka practice from the source. Day numbers count from transplanting (−21 = three weeks before).',
        startDay: -21, endDay: 0, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Dry ploughing', text: 'Dry plough the main field twice, three weeks before planting.', source: 'fieldPrep' },
          { title: 'Organic manure', text: 'Incorporate 5–7 tonnes of FYM or compost, or 1 tonne of poultry manure per hectare, or 10 tonnes of green leaf manure, three weeks before transplanting.', source: 'fieldPrep' },
          { title: 'Puddling', text: 'Plough the field 2–3 times with 5–10 cm of standing water. This is called puddling.', source: 'fieldPrep' },
          { title: 'Basal fertilizer', text: 'Apply the fertilizers recommended for basal application before the last puddling and mix them into the soil. After fertilizing, do not let water move from one field to another.', source: 'fieldPrep' },
          { title: 'Level the field', text: 'Level the field properly before transplanting. Dig the corners that the plough did not cover.', source: 'fieldPrep' },
          { title: 'Clean and plaster the bunds', text: 'Cut 2.5 cm of soil from the top and sides of the bunds to remove weeds with their seeds and pest eggs. Trim very broad bunds to 15 cm width and 15 cm height so rats do not live in them. Plaster the sides and top with mud paste 2.5 cm thick.', source: 'fieldPrep' },
          { title: 'Acid soils', text: 'For acid soils, apply lime based on soil analysis. Lime is applied at 2.5 t/ha before the last ploughing.', source: 'fieldPrep', type: 'TIP' },
        ],
        resources: [
          { type: 'MACHINERY', name: 'Plough / puddler' },
          { type: 'TOOL', name: 'Spade (bund trimming and plastering)' },
          { type: 'INPUT', name: 'FYM, compost, poultry manure or green leaf manure' },
        ],
      },
      {
        type: 'TRANSPLANTING',
        title: 'Transplanting',
        startDay: 0, endDay: 10, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Spacing in Karnataka', text: 'Plant at 20 × 10 cm (50 hills per square metre) with 2–3 seedlings per hill. For short-duration varieties use 15 × 10 cm (67 hills per square metre).', source: 'establishment' },
          { title: 'Plant quickly', text: 'Transplant within 30 minutes of pulling out the seedlings.', source: 'establishment' },
          { title: 'Plant shallow', text: 'Shallow planting (3 cm) gives quick establishment and more tillers. Planting deeper than 5 cm delays establishment and reduces tillers.', source: 'establishment' },
          { title: 'Water at transplanting', text: 'Keep a shallow 2 cm of water at transplanting; deep water leads to deep planting and fewer tillers.', source: 'irrigation' },
          { title: 'Root dipping (biofertilizer)', text: 'Make a slurry of 5 packets (1000 g)/ha Azospirillum and 5 packets (1000 g)/ha Phosphobacteria, or 10 packets (2000 g)/ha Azophos, in 40 litres of water. Dip the seedling roots for 15–30 minutes, then transplant.', source: 'establishment' },
          { title: 'Tungabhadra command area', text: 'For long-duration varieties such as Sona Masuri transplanted late (15–30 August), use 45-day-old seedlings and plant 3–4 seedlings per hill.', source: 'establishment', type: 'TIP' },
          { title: 'Gap filling', text: 'Fill any gaps within 7–10 days after transplanting.', source: 'establishment' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Water management',
        startDay: 0, anchor: 'TRANSPLANTING', continuous: true,
        instructions: [
          { title: 'First week', text: 'Maintain 2 cm of water up to seven days after transplanting.', source: 'irrigation' },
          { title: 'After establishment', text: 'Cyclic submergence of 5 cm is the best practice and continues through the crop. Irrigate after the ponded water disappears: loamy soil — 1 day after in summer, 3 days after in winter; clay soil — just before or immediately after in summer, 1–2 days after in winter.', source: 'irrigation' },
          { title: 'Critical stages', text: 'Do not let the soil dry below saturation at active tillering, panicle initiation, booting, heading and flowering. Moisture stress at active tillering can reduce yield by 30%, and at the reproductive phase by 50–60%.', source: 'water', type: 'PRECAUTION' },
          { title: 'Save water', text: 'Keep standing water at 5 cm or less to reduce percolation loss, and do not let cracks develop.', source: 'irrigation', type: 'TIP' },
        ],
        mistakes: [
          { title: 'Field-to-field irrigation', consequence: 'Water and applied nutrients flow between fields.', prevention: 'Irrigate each field separately from a channel.', source: 'irrigation' },
        ],
      },
      {
        type: 'IRRIGATION_NUTRIENT',
        title: 'Nutrient management',
        description: 'The fertilizer dose for your district in Karnataka is not included yet — ask your Raitha Samparka Kendra or KVK, or use your soil test card.',
        startDay: 0, anchor: 'TRANSPLANTING', continuous: true,
        instructions: [
          { title: 'Zinc', text: 'Apply 25 kg of zinc sulphate mixed with 50 kg of sand before transplanting. 12.5 kg zinc sulphate per hectare is enough if green manure (6.25 t/ha) or enriched FYM is applied.', source: 'nutrient' },
          { title: 'Leaf colour chart (LCC) for nitrogen', text: 'Start at 14 days after transplanting and check every 7–10 days until flowering. Use the third leaf from the top on 10 plants, in the morning (8–10 am), always by the same person. If six or more of the ten leaves read below the critical value, top-dress nitrogen at 35 kg N/ha in the dry season or 30 kg N/ha in the wet season.', source: 'nutrient' },
          { title: 'LCC critical value', text: 'The critical LCC value is 3.0 for low-nitrogen-response varieties (for example White Ponni) and 4.0 for other varieties and hybrids (Tamil Nadu values).', source: 'nutrient', type: 'DECISION' },
        ],
        resources: [{ type: 'TOOL', name: 'Leaf colour chart (LCC)' }],
      },
      {
        type: 'WEED_MANAGEMENT',
        title: 'Weed management',
        startDay: 15, endDay: 45, anchor: 'TRANSPLANTING',
        instructions: [
          { title: 'Critical period', text: 'For transplanted rice, the critical period of weed competition is 15–45 days.', source: 'weeds', type: 'OBSERVATION' },
          { title: 'Hand weeding (Karnataka)', text: 'Hand weed at 20 and 40 days after transplanting.', source: 'weeds' },
          { title: 'Rotary / cono weeder', text: 'Use a rotary weeder four times from 15 days after transplanting at 10-day intervals. It saves labour and aerates the soil and root zone.', source: 'weeds' },
          { title: 'Prevent weeds', text: 'Use weed-free seed and a weed-free seed bed, clean tools, and clean irrigation channels and bunds.', source: 'weeds', type: 'TIP' },
          { title: 'Herbicides', text: CHEMICAL_CAUTION, source: 'weeds', type: 'PRECAUTION', safety: { level: 'CAUTION', info: CHEMICAL_CAUTION } },
        ],
        resources: [{ type: 'EQUIPMENT', name: 'Rotary weeder / cono weeder' }],
      },
      {
        type: 'HARVESTING',
        title: 'Harvesting',
        instructions: [
          { title: 'Drain the field', text: 'Drain water from the field about 7–10 days before harvest to make harvesting easier.', source: 'water' },
          { title: 'Right stage to harvest', text: 'Harvest when about 80% of the panicles have 80% ripened spikelets and their upper portion is straw coloured; the grain then has about 20% moisture. Grains on the lower part of the panicle should be in the hard dough stage.', source: 'harvest', type: 'DECISION' },
          { title: 'Method', text: 'Harvest by hand with sickles, or by reaper or combine harvester.', source: 'harvest' },
        ],
        resources: [{ type: 'TOOL', name: 'Sickle' }],
      },
      {
        type: 'POST_HARVEST',
        title: 'Threshing, drying and storage',
        instructions: [
          { title: 'Thresh immediately', text: 'Thresh immediately after harvesting to keep grain quality high.', source: 'harvest' },
          { title: 'Dry well in the sun', text: 'Freshly threshed rice must be dried well in the sun. Spread the grain on concrete floors, mats or plastic sheets.', source: 'harvest' },
          { title: 'Store clean, dry grain', text: 'Store healthy, clean and uniformly dried grain in a structure that protects it from weather and pests. Bags are convenient for short-term storage.', source: 'harvest' },
        ],
        mistakes: [
          { title: 'Leaving harvested crop in the field or stacked for days', consequence: 'Over-drying affects grain quality; stacked high-moisture grain becomes discoloured or yellow.', prevention: 'Thresh soon after harvest and dry the grain properly.', source: 'harvest' },
        ],
      },
    ],
  },
  translations: {
    kn: { guide: 'ನಾಟಿ ಭತ್ತ' },
    hi: { guide: 'रोपाई वाला धान' },
  },
};
