/**
 * Live weather with caching (ADR 0012).
 * - Coordinates are rounded to a 0.1° grid (~11 km) so nearby farms share one provider call.
 * - A fresh snapshot (< 30 min) is served from the database (WeatherSnapshot).
 * - If the provider fails, the last snapshot up to 24 h old is returned with stale = true;
 *   otherwise 503 WEATHER_UNAVAILABLE.
 * Weather data is external information, kept apart from verified agricultural knowledge.
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';
import { errorForLog, type Logger } from '../config/logger.ts';
import { buildForecastUrl, parseForecast, type WeatherReport } from '../integrations/open-meteo.ts';
import { HttpError } from '../utils/http-error.ts';

const FRESH_MS = 30 * 60 * 1000;
const STALE_LIMIT_MS = 24 * 60 * 60 * 1000;
const PROVIDER_TIMEOUT_MS = 8000;

export const roundToGrid = (value: number) => Math.round(value * 10) / 10;

export type WeatherService = ReturnType<typeof createWeatherService>;

export function createWeatherService(deps: { prisma: PrismaClient; logger: Logger; fetchImpl: typeof fetch }) {
  const { prisma, logger, fetchImpl } = deps;

  async function latestSnapshot(lat: number, lon: number, maxAgeMs: number) {
    return prisma.weatherSnapshot.findFirst({
      where: {
        provider: 'OPEN_METEO', snapshotType: 'FORECAST',
        latitude: lat.toFixed(6), longitude: lon.toFixed(6),
        fetchedAt: { gte: new Date(Date.now() - maxAgeMs) },
      },
      orderBy: { fetchedAt: 'desc' },
      select: { id: true, fetchedAt: true, rawPayload: true },
    });
  }

  function view(lat: number, lon: number, report: WeatherReport, fetchedAt: Date, stale: boolean) {
    return {
      location: { latitude: lat, longitude: lon, gridKm: 11 },
      ...report,
      source: { provider: 'Open-Meteo', url: 'https://open-meteo.com/', attribution: 'Weather data by Open-Meteo.com' },
      fetchedAt: fetchedAt.toISOString(),
      stale,
    };
  }

  return {
    async forecast(latitude: number, longitude: number) {
      const lat = roundToGrid(latitude);
      const lon = roundToGrid(longitude);

      const fresh = await latestSnapshot(lat, lon, FRESH_MS);
      if (fresh) return view(lat, lon, parseForecast(fresh.rawPayload), fresh.fetchedAt, false);

      try {
        const response = await fetchImpl(buildForecastUrl(lat, lon), { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
        if (!response.ok) throw new Error(`Weather provider responded with HTTP ${response.status}`);
        const raw = (await response.json()) as unknown;
        const report = parseForecast(raw);
        const today = report.daily[0];
        const start = new Date();
        const saved = await prisma.weatherSnapshot.create({
          data: {
            provider: 'OPEN_METEO', snapshotType: 'FORECAST',
            latitude: lat.toFixed(6), longitude: lon.toFixed(6),
            periodStart: start, periodEnd: new Date(start.getTime() + report.daily.length * 86_400_000),
            temperatureMinC: today?.temperatureMinC ?? null, temperatureMaxC: today?.temperatureMaxC ?? null,
            temperatureMeanC: report.current.temperatureC, rainfallMm: today?.precipitationMm ?? null,
            relativeHumidityPct: report.current.relativeHumidityPct, windSpeedKmph: report.current.windSpeedKmph,
            rawPayload: raw as object,
          },
          select: { fetchedAt: true },
        });
        return view(lat, lon, report, saved.fetchedAt, false);
      } catch (error) {
        logger.warn({ err: errorForLog(error), lat, lon }, 'Weather provider request failed');
        const fallback = await latestSnapshot(lat, lon, STALE_LIMIT_MS);
        if (fallback) return view(lat, lon, parseForecast(fallback.rawPayload), fallback.fetchedAt, true);
        throw new HttpError(503, 'WEATHER_UNAVAILABLE', 'Weather information is not available right now.');
      }
    },
  };
}
