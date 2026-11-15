import { Router } from 'express';
import { z } from 'zod';
import { getValidated, validate } from '../middleware/validate.ts';
import type { WeatherService } from '../services/weather.service.ts';
import { sendSuccess } from '../utils/response.ts';

const weatherQuery = z.object({
  lat: z.coerce.number({ error: 'must be a number' }).min(-90).max(90),
  lon: z.coerce.number({ error: 'must be a number' }).min(-180).max(180),
});

/** GET /weather?lat=12.97&lon=77.59 — public, rate-limited. */
export function createWeatherRouter(weather: WeatherService): Router {
  const router = Router();
  router.get('/weather', validate({ query: weatherQuery }), async (_req, res) => {
    const { query } = getValidated<{ query: { lat: number; lon: number } }>(res);
    sendSuccess(res, await weather.forecast(query.lat, query.lon));
  });
  return router;
}
