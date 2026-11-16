/**
 * Seed entry point — `npm run db:seed` (or `prisma db seed`).
 * Idempotent: running it again updates rows in place instead of duplicating them.
 */
import { prisma } from '../../src/db/prisma.ts';
import { seedCatalog } from './catalog.ts';
import { LAUNCH_CROP_CONTENT } from './content/index.ts';
import { loadCropContent } from './content/load.ts';
import { seedReference } from './reference.ts';

async function main() {
  const started = Date.now();
  await seedReference(prisma);
  await seedCatalog(prisma);
  for (const content of LAUNCH_CROP_CONTENT) {
    const r = await loadCropContent(prisma, content);
    console.log(`content: ${r.cropSlug} — ${r.stages} stages`);
  }

  const counts = {
    roles: await prisma.role.count(),
    languages: await prisma.language.count(),
    units: await prisma.measurementUnit.count(),
    regions: await prisma.region.count(),
    soilTypes: await prisma.soilType.count(),
    seasons: await prisma.season.count(),
    parameters: await prisma.agronomicParameter.count(),
    waterSourceTypes: await prisma.waterSourceType.count(),
    stageTypes: await prisma.stageType.count(),
    cultivationMethods: await prisma.cultivationMethod.count(),
    categories: await prisma.cropCategory.count(),
    crops: await prisma.crop.count(),
    categoryMappings: await prisma.cropCategoryMapping.count(),
    varieties: await prisma.cropVariety.count(),
    translations: await prisma.translation.count(),
    procedures: await prisma.growingProcedure.count(),
    stages: await prisma.growingStage.count(),
    instructions: await prisma.stageInstruction.count(),
    sources: await prisma.contentSource.count(),
    requirements: await prisma.cropRequirement.count(),
    seasonMappings: await prisma.cropSeasonMapping.count(),
  };
  console.log(`Seed completed in ${Date.now() - started} ms`);
  console.table(counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
