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
        { method: 'POST', path: '/api/v1/auth/device', description: 'Create a device account (returns a token)' },
        { method: 'GET', path: '/api/v1/me', description: 'Current account' },
        { method: 'GET', path: '/api/v1/reference', description: 'Languages, soil types, seasons, units…' },
        { method: 'GET', path: '/api/v1/categories', description: 'Crop category tree' },
        { method: 'GET', path: '/api/v1/crops', description: 'Published crops (?category, ?q)' },
        { method: 'GET', path: '/api/v1/crops/{slug}', description: 'Crop details and growing guides' },
        { method: 'GET', path: '/api/v1/procedures/{id}', description: 'Complete growing guide' },
        { method: 'GET', path: '/api/v1/weather', description: 'Live weather (?lat, ?lon)' },
        { method: 'GET', path: '/api/v1/farms', description: 'My farms (sign-in)' },
        { method: 'GET', path: '/api/v1/farm-crops', description: 'My crops (sign-in)' },
        { method: 'POST', path: '/api/v1/recommendations', description: 'What should I grow? (sign-in)' },
      ],
    });
  };
}
