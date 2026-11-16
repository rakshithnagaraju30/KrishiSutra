/**
 * Version 1 router, mounted at /api/v1. Each module contributes one sub-router.
 */
import { Router } from 'express';
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { AppConfig } from '../config/env.ts';
import { createApiInfoController } from '../controllers/api-info.controller.ts';
import { createRequireAuth } from '../middleware/auth.ts';
import type { RateLimiters } from '../middleware/rate-limit.ts';
import type { Services } from '../services/index.ts';
import { createAuthRouter } from './auth.routes.ts';
import { createCatalogRouter } from './catalog.routes.ts';
import { createFarmRouter } from './farm.routes.ts';
import { createHealthRouter } from './health.routes.ts';
import { createRecommendationRouter } from './recommendation.routes.ts';
import { createUsersRouter } from './users.routes.ts';
import { createWeatherRouter } from './weather.routes.ts';

export function createV1Router(deps: { config: AppConfig; prisma: PrismaClient; services: Services; limiters: RateLimiters }): Router {
  const { services, limiters } = deps;
  const router = Router();
  const requireAuth = createRequireAuth({ prisma: deps.prisma, device: services.auth, phone: services.phoneAuth });

  router.get('/', createApiInfoController(deps.config));
  router.use('/health', createHealthRouter(services.health));
  router.use(limiters.api);
  router.use(createAuthRouter({ auth: services.auth, requireAuth, registrationLimiter: limiters.registration }));
  router.use(createUsersRouter({ phone: services.phoneAuth, users: services.users, requireAuth, otpLimiter: limiters.otp }));
  router.use(createCatalogRouter(services.catalog));
  router.use(createWeatherRouter(services.weather));
  router.use(createFarmRouter({ farms: services.farms, requireAuth }));
  router.use(createRecommendationRouter({ recommendations: services.recommendations, requireAuth }));
  return router;
}
