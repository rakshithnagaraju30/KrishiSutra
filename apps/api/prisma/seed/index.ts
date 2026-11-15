/**
 * Seed entry point — `npm run db:seed` (or `prisma db seed`).
 * Idempotent: running it again updates rows in place instead of duplicating them.
 */
import { prisma } from '../../src/db/prisma.ts';
import { seedCatalog } from './catalog.ts';
import { seedReference } from './reference.ts';

async function main() {
  const started = Date.now();
  await seedReference(prisma);
  await seedCatalog(prisma);

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
