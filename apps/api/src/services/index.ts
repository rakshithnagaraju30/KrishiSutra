/**
 * Builds every module's service from shared dependencies (one Prisma Client, one logger).
 * Routes receive this bundle, so each piece can be replaced in tests.
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { AppConfig } from '../config/env.ts';
import type { Logger } from '../config/logger.ts';
import type { DatabaseCheck } from '../db/health.ts';
import { createAuthService } from './auth.service.ts';
import { createCatalogService } from './catalog.service.ts';
import { createFarmService } from './farm.service.ts';
import { createHealthService } from './health.service.ts';
import { createRecommendationService } from './recommendation.service.ts';
import { createWeatherService } from './weather.service.ts';

export type ServiceDependencies = {
  config: AppConfig;
  logger: Logger;
  prisma: PrismaClient;
  checkDatabase: DatabaseCheck;
  isShuttingDown: () => boolean;
  /** HTTP client for external APIs (weather); injectable for tests. */
  fetchImpl: typeof fetch;
};

export function createServices(deps: ServiceDependencies) {
  return {
    health: createHealthService(deps),
    auth: createAuthService(deps.prisma),
    catalog: createCatalogService(deps.prisma),
    weather: createWeatherService(deps),
    farms: createFarmService(deps.prisma),
    recommendations: createRecommendationService(deps.prisma),
  };
}

export type Services = ReturnType<typeof createServices>;
