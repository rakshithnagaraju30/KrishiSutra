/**
 * Builds every module's service from shared dependencies (one Prisma Client, one logger).
 * Routes receive this bundle, so each piece can be replaced in tests.
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { AppConfig } from '../config/env.ts';
import type { Logger } from '../config/logger.ts';
import type { DatabaseCheck } from '../db/health.ts';
import type { SmsSender } from '../integrations/sms/index.ts';
import { createAuthService } from './auth.service.ts';
import { createCatalogService } from './catalog.service.ts';
import { createFarmService } from './farm.service.ts';
import { createHealthService } from './health.service.ts';
import { createPhoneAuthService } from './phone-auth.service.ts';
import { createRecommendationService } from './recommendation.service.ts';
import { createUserService } from './user.service.ts';
import { createWeatherService } from './weather.service.ts';

export type ServiceDependencies = {
  config: AppConfig;
  logger: Logger;
  prisma: PrismaClient;
  checkDatabase: DatabaseCheck;
  isShuttingDown: () => boolean;
  /** HTTP client for external APIs (weather); injectable for tests. */
  fetchImpl: typeof fetch;
  /** OTP SMS sender; null = phone sign-in disabled (503). */
  smsSender: SmsSender | null;
};

export function createServices(deps: ServiceDependencies) {
  const auth = createAuthService(deps.prisma);
  return {
    health: createHealthService(deps),
    auth,
    phoneAuth: createPhoneAuthService({ prisma: deps.prisma, config: deps.config, logger: deps.logger, sms: deps.smsSender, device: auth }),
    users: createUserService(deps.prisma),
    catalog: createCatalogService(deps.prisma),
    weather: createWeatherService(deps),
    farms: createFarmService(deps.prisma),
    recommendations: createRecommendationService(deps.prisma),
  };
}

export type Services = ReturnType<typeof createServices>;
