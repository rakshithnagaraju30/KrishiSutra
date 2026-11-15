/**
 * Version 1 router, mounted at /api/v1. Each module adds one sub-router here
 * (e.g. router.use('/farms', createFarmRouter(...)) in Part 3.2+).
 */
import { Router } from 'express';
import type { AppConfig } from '../config/env.ts';
import { createApiInfoController } from '../controllers/api-info.controller.ts';
import type { HealthService } from '../services/health.service.ts';
import { createHealthRouter } from './health.routes.ts';

export function createV1Router(deps: { config: AppConfig; health: HealthService }): Router {
  const router = Router();
  router.get('/', createApiInfoController(deps.config));
  router.use('/health', createHealthRouter(deps.health));
  return router;
}
