/**
 * Crop categories (2 levels), sample crops with multiple categories, demonstration varieties,
 * draft name translations, and one demonstration growing procedure.
 *
 * DEMONSTRATION CONTENT ONLY: everything is DRAFT / UNVERIFIED and contains no agronomic values
 * (no durations, doses, yields or costs). Real content is added through the review workflow.
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';
import { DEMO_SOURCE_TITLE } from './reference.ts';

type Names = { en: string; kn?: string; hi?: string };
type CategorySeed = { slug: string; names: Names; iconName: string; children?: { slug: string; name: string }[] };

export const CATEGORIES: CategorySeed[] = [
  {
    slug: 'food-crops', iconName: 'grain',
    names: { en: 'Food Crops', kn: 'ಆಹಾರ ಬೆಳೆಗಳು', hi: 'खाद्य फसलें' },
    children: [
      { slug: 'cereals', name: 'Cereals' },
      { slug: 'millets', name: 'Millets' },
      { slug: 'pulses', name: 'Pulses' },
    ],
  },
  {
    slug: 'commercial-cash-crops', iconName: 'coins',
    names: { en: 'Commercial / Cash Crops', kn: 'ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು', hi: 'नकदी फसलें' },
    children: [
      { slug: 'fibre-crops', name: 'Fibre Crops' },
      { slug: 'sugar-crops', name: 'Sugar Crops' },
    ],
  },
  {
    slug: 'flower-crops', iconName: 'flower',
    names: { en: 'Flower Crops', kn: 'ಹೂವಿನ ಬೆಳೆಗಳು', hi: 'फूलों की फसलें' },
    children: [
      { slug: 'loose-flowers', name: 'Loose Flowers' },
      { slug: 'cut-flowers', name: 'Cut Flowers' },
    ],
  },
  {
    slug: 'vegetable-crops', iconName: 'vegetable',
    names: { en: 'Vegetable Crops', kn: 'ತರಕಾರಿ ಬೆಳೆಗಳು', hi: 'सब्ज़ी फसलें' },
    children: [
      { slug: 'solanaceous-vegetables', name: 'Solanaceous Vegetables' },
      { slug: 'bulb-vegetables', name: 'Bulb Vegetables' },
      { slug: 'leafy-vegetables', name: 'Leafy Vegetables' },
    ],
  },
  {
    slug: 'fruit-crops', iconName: 'fruit',
    names: { en: 'Fruit Crops', kn: 'ಹಣ್ಣಿನ ಬೆಳೆಗಳು', hi: 'फल फसलें' },
    children: [{ slug: 'tropical-fruits', name: 'Tropical Fruits' }],
  },
  { slug: 'oilseed-crops', iconName: 'oil', names: { en: 'Oilseed Crops', kn: 'ಎಣ್ಣೆಕಾಳು ಬೆಳೆಗಳು', hi: 'तिलहन फसलें' } },
  { slug: 'spice-crops', iconName: 'spice', names: { en: 'Spice Crops', kn: 'ಸಾಂಬಾರ ಬೆಳೆಗಳು', hi: 'मसाला फसलें' } },
  { slug: 'plantation-crops', iconName: 'palm', names: { en: 'Plantation Crops', kn: 'ತೋಟದ ಬೆಳೆಗಳು', hi: 'बागान फसलें' } },
  {
    slug: 'medicinal-aromatic-crops', iconName: 'herb',
    names: { en: 'Medicinal and Aromatic Crops', kn: 'ಔಷಧೀಯ ಮತ್ತು ಸುಗಂಧ ಬೆಳೆಗಳು', hi: 'औषधीय और सुगंधित फसलें' },
    children: [
      { slug: 'medicinal-plants', name: 'Medicinal Plants' },
      { slug: 'aromatic-plants', name: 'Aromatic Plants' },
    ],
  },
  { slug: 'fodder-crops', iconName: 'cow', names: { en: 'Fodder Crops', kn: 'ಮೇವಿನ ಬೆಳೆಗಳು', hi: 'चारा फसलें' } },
];

type CropSeed = {
  slug: string;
  names: Names;
  scientificName: string;
  lifeCycle?: 'PERENNIAL';
  /** First entry is the primary category. */
  categories: string[];
};

/** Sample crops requested for Part 2 plus the remaining launch crops (maize, chilli, onion). */
export const CROPS: CropSeed[] = [
  { slug: 'rice', names: { en: 'Rice (Paddy)', kn: 'ಭತ್ತ', hi: 'धान' }, scientificName: 'Oryza sativa', categories: ['cereals'] },
  { slug: 'maize', names: { en: 'Maize', kn: 'ಮೆಕ್ಕೆಜೋಳ', hi: 'मक्का' }, scientificName: 'Zea mays', categories: ['cereals', 'fodder-crops'] },
  { slug: 'tomato', names: { en: 'Tomato', kn: 'ಟೊಮೆಟೊ', hi: 'टमाटर' }, scientificName: 'Solanum lycopersicum', categories: ['solanaceous-vegetables'] },
  { slug: 'chilli', names: { en: 'Chilli', kn: 'ಮೆಣಸಿನಕಾಯಿ', hi: 'मिर्च' }, scientificName: 'Capsicum annuum', categories: ['solanaceous-vegetables', 'spice-crops'] },
  { slug: 'onion', names: { en: 'Onion', kn: 'ಈರುಳ್ಳಿ', hi: 'प्याज' }, scientificName: 'Allium cepa', categories: ['bulb-vegetables'] },
  { slug: 'groundnut', names: { en: 'Groundnut', kn: 'ಶೇಂಗಾ', hi: 'मूंगफली' }, scientificName: 'Arachis hypogaea', categories: ['oilseed-crops', 'commercial-cash-crops'] },
  { slug: 'cotton', names: { en: 'Cotton', kn: 'ಹತ್ತಿ', hi: 'कपास' }, scientificName: 'Gossypium spp.', categories: ['fibre-crops'] },
  { slug: 'mango', names: { en: 'Mango', kn: 'ಮಾವು', hi: 'आम' }, scientificName: 'Mangifera indica', lifeCycle: 'PERENNIAL', categories: ['tropical-fruits'] },
  { slug: 'marigold', names: { en: 'Marigold', kn: 'ಚೆಂಡು ಹೂವು', hi: 'गेंदा' }, scientificName: 'Tagetes spp.', categories: ['loose-flowers'] },
];

/** Stage titles of the demonstration rice procedure (structure only — no days, doses or advice). */
const DEMO_RICE_STAGES: { title: string; stageType: string }[] = [
  { title: 'Land preparation', stageType: 'LAND_PREPARATION' },
  { title: 'Seed selection and treatment', stageType: 'SEED_SELECTION_TREATMENT' },
  { title: 'Nursery preparation', stageType: 'NURSERY' },
  { title: 'Transplanting', stageType: 'TRANSPLANTING' },
  { title: 'Irrigation and nutrient management', stageType: 'IRRIGATION_NUTRIENT' },
  { title: 'Weed management', stageType: 'WEED_MANAGEMENT' },
  { title: 'Disease and pest management', stageType: 'PEST_DISEASE_MANAGEMENT' },
  { title: 'Harvesting', stageType: 'HARVESTING' },
  { title: 'Post-harvest management', stageType: 'POST_HARVEST' },
];

const DEMO_INSTRUCTION =
  'Demonstration instruction — to be replaced with verified content from a cited source (UAS / ICAR / KVK).';

export async function seedCatalog(prisma: PrismaClient) {
  const lang = Object.fromEntries((await prisma.language.findMany()).map((l) => [l.code, l.id])) as Record<string, string>;
  const source = await prisma.contentSource.findFirstOrThrow({ where: { title: DEMO_SOURCE_TITLE } });

  const translate = async (target: { cropCategoryId?: string; cropId?: string }, names: Names) => {
    for (const code of ['kn', 'hi'] as const) {
      const value = names[code];
      const languageId = lang[code];
      if (!value || !languageId) continue;
      const existing = await prisma.translation.findFirst({ where: { ...target, field: 'NAME', languageId } });
      if (existing) await prisma.translation.update({ where: { id: existing.id }, data: { value } });
      else await prisma.translation.create({ data: { ...target, field: 'NAME', languageId, value, status: 'DRAFT' } });
    }
  };

  // ---- Categories (top level + subcategories) ----
  const categoryId: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const parent = await prisma.cropCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.names.en, iconName: c.iconName, displayOrder: i + 1 },
      create: { slug: c.slug, name: c.names.en, iconName: c.iconName, displayOrder: i + 1 },
    });
    categoryId[c.slug] = parent.id;
    await translate({ cropCategoryId: parent.id }, c.names);
    for (const [j, child] of (c.children ?? []).entries()) {
      const sub = await prisma.cropCategory.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id, displayOrder: j + 1 },
        create: { slug: child.slug, name: child.name, parentId: parent.id, displayOrder: j + 1 },
      });
      categoryId[child.slug] = sub.id;
    }
  }

  // ---- Crops, category mappings, demo varieties ----
  for (const c of CROPS) {
    const crop = await prisma.crop.upsert({
      where: { slug: c.slug },
      update: { commonName: c.names.en, scientificName: c.scientificName, lifeCycle: c.lifeCycle ?? null },
      create: {
        slug: c.slug,
        commonName: c.names.en,
        scientificName: c.scientificName,
        lifeCycle: c.lifeCycle ?? null,
        description: 'Demonstration crop record. Agronomic details will be added from verified sources.',
        status: 'DRAFT',
      },
    });
    await translate({ cropId: crop.id }, c.names);

    for (const [i, slug] of c.categories.entries()) {
      const catId = categoryId[slug];
      if (!catId) throw new Error(`Unknown category ${slug}`);
      await prisma.cropCategoryMapping.upsert({
        where: { cropId_categoryId: { cropId: crop.id, categoryId: catId } },
        update: { isPrimary: i === 0, displayOrder: i },
        create: { cropId: crop.id, categoryId: catId, isPrimary: i === 0, displayOrder: i },
      });
    }

    for (const letter of ['A', 'B']) {
      const slug = `demo-variety-${letter.toLowerCase()}`;
      await prisma.cropVariety.upsert({
        where: { cropId_slug: { cropId: crop.id, slug } },
        update: {},
        create: {
          cropId: crop.id,
          slug,
          name: `Demo variety ${letter}`,
          description: 'Demonstration record — not a real released variety.',
          sourceId: source.id,
          status: 'DRAFT',
          verificationStatus: 'UNVERIFIED',
        },
      });
    }
  }

  // ---- One demonstration growing procedure (rice, transplanted), version 1 DRAFT ----
  const rice = await prisma.crop.findUniqueOrThrow({ where: { slug: 'rice' } });
  const transplanted = await prisma.cultivationMethod.findUniqueOrThrow({ where: { code: 'TRANSPLANTED' } });
  const stageTypes = Object.fromEntries((await prisma.stageType.findMany()).map((s) => [s.code, s.id])) as Record<string, string>;

  // Procedure, version, stages and instructions are created together or not at all.
  await prisma.$transaction(async (tx) => {
    const procedure = await tx.growingProcedure.upsert({
      where: { cropId_slug: { cropId: rice.id, slug: 'transplanted-demo' } },
      update: {},
      create: {
        cropId: rice.id,
        cultivationMethodId: transplanted.id,
        slug: 'transplanted-demo',
        name: 'Transplanted rice (demonstration)',
        description: 'Demonstration procedure showing the structure only. Not agricultural advice.',
        isDefault: true,
        status: 'DRAFT',
      },
    });
    const version = await tx.procedureVersion.upsert({
      where: { procedureId_versionNumber: { procedureId: procedure.id, versionNumber: 1 } },
      update: {},
      create: { procedureId: procedure.id, versionNumber: 1, status: 'DRAFT', sourceId: source.id, changeSummary: 'Initial demonstration structure.' },
    });
    const stageCount = await tx.growingStage.count({ where: { procedureVersionId: version.id } });
    if (stageCount > 0) return;
    for (const [i, s] of DEMO_RICE_STAGES.entries()) {
      await tx.growingStage.create({
        data: {
          procedureVersionId: version.id,
          procedureId: procedure.id,
          stageTypeId: stageTypes[s.stageType] ?? null,
          sequence: i + 1,
          title: s.title,
          description: 'Demonstration stage. Timing and details pending verified sources.',
          instructions: {
            create: [{ sequence: 1, title: 'Demonstration instruction', description: DEMO_INSTRUCTION, sourceId: source.id }],
          },
        },
      });
    }
  }, { timeout: 120_000, maxWait: 30_000 }); // generous: a remote database (e.g. Neon) adds latency per query
}
