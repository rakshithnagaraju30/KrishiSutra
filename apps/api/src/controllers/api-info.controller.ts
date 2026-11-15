import type { RequestHandler } from 'express';
import type { AppConfig } from '../config/env.ts';
import { API_VERSION } from '../services/health.service.ts';
import { sendSuccess } from '../utils/response.ts';

/** GET /api/v1 — what this API is and which endpoints exist in this version. */
export function createApiInfoController(config: Pick<AppConfig, 'appVersion'>): RequestHandler {
  return (_req, res) => {
    sendSuccess(res, {
      name: 'KrishiSutra API',
      apiVersion: API_VERSION,
      version: config.appVersion,
      endpoints: [
        { method: 'GET', path: '/api/v1', description: 'API information' },
        { method: 'GET', path: '/api/v1/health', description: 'Application health' },
        { method: 'GET', path: '/api/v1/health/database', description: 'Database connectivity' },
      ],
    });
  };
}
