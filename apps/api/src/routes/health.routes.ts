import { Router } from 'express';
import { createHealthController } from '../controllers/health.controller.ts';
import type { HealthService } from '../services/health.service.ts';

export function createHealthRouter(health: HealthService): Router {
  const router = Router();
  const controller = createHealthController(health);
  router.get('/', controller.getStatus);
  router.get('/database', controller.getDatabaseStatus);
  return router;
}
