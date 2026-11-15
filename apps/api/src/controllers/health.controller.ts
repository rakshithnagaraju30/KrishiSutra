import type { RequestHandler } from 'express';
import type { HealthService } from '../services/health.service.ts';
import { sendSuccess } from '../utils/response.ts';

export function createHealthController(health: HealthService) {
  const getStatus: RequestHandler = (_req, res) => {
    const status = health.getStatus();
    // 503 while shutting down, so load balancers stop sending traffic.
    sendSuccess(res, status, status.status === 'ok' ? 200 : 503);
  };

  // Express 5 forwards rejected promises to the error handler automatically.
  const getDatabaseStatus: RequestHandler = async (_req, res) => {
    sendSuccess(res, await health.getDatabaseStatus());
  };

  return { getStatus, getDatabaseStatus };
}
