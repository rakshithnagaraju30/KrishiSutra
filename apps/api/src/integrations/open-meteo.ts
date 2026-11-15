/**
 * Open-Meteo adapter (ADR 0012). Converts the provider's response into KrishiSutra's own shape, so
 * the rest of the code never depends on the provider's field names.
 * Licence note: Open-Meteo's free API is for non-commercial use; production needs its commercial plan
 * or another provider behind this same interface (assumption AS5).
 */
export const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export type WeatherCondition =
  | 'CLEAR' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'FOG' | 'DRIZZLE' | 'RAIN' | 'SHOWERS' | 'THUNDERSTORM' | 'SNOW' | 'UNKNOWN';

/** WMO weather interpretation codes → condition. */
export function conditionFromWmo(code: number | null | undefined): WeatherCondition {
  if (code === null || code === undefined) return 'UNKNOWN';
  if (code === 0) return 'CLEAR';
  if (code === 1 || code === 2) return 'PARTLY_CLOUDY';
  if (code === 3) return 'CLOUDY';
  if (code === 45 || code === 48) return 'FOG';
  if (code >= 51 && code <= 57) return 'DRIZZLE';
  if ((code >= 61 && code <= 67)) return 'RAIN';
  if (code >= 71 && code <= 77) return 'SNOW';
  if (code >= 80 && code <= 82) return 'SHOWERS';
  if (code === 85 || code === 86) return 'SNOW';
  if (code >= 95 && code <= 99) return 'THUNDERSTORM';
  return 'UNKNOWN';
}

export type WeatherReport = {
  current: {
    time: string;
    temperatureC: number | null;
    relativeHumidityPct: number | null;
    precipitationMm: number | null;
    windSpeedKmph: number | null;
    condition: WeatherCondition;
  };
  daily: Array<{
    date: string;
    temperatureMinC: number | null;
    temperatureMaxC: number | null;
    precipitationMm: number | null;
    precipitationProbabilityPct: number | null;
    condition: WeatherCondition;
  }>;
};

export function buildForecastUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(2),
    longitude: longitude.toFixed(2),
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    timezone: 'Asia/Kolkata',
    forecast_days: '7',
  });
  return `${OPEN_METEO_URL}?${params.toString()}`;
}

const n = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

type Raw = {
  current?: Record<string, unknown>;
  daily?: Record<string, unknown[] | undefined>;
};

export function parseForecast(raw: unknown): WeatherReport {
  const r = raw as Raw;
  if (!r || typeof r !== 'object' || !r.current || !r.daily || !Array.isArray(r.daily.time)) {
    throw new Error('Unexpected weather provider response');
  }
  const c = r.current;
  const d = r.daily;
  const at = (key: string, i: number) => n(d[key]?.[i]);
  return {
    current: {
      time: String(c.time ?? ''),
      temperatureC: n(c.temperature_2m),
      relativeHumidityPct: n(c.relative_humidity_2m),
      precipitationMm: n(c.precipitation),
      windSpeedKmph: n(c.wind_speed_10m),
      condition: conditionFromWmo(n(c.weather_code)),
    },
    daily: (d.time as unknown[]).map((date, i) => ({
      date: String(date),
      temperatureMinC: at('temperature_2m_min', i),
      temperatureMaxC: at('temperature_2m_max', i),
      precipitationMm: at('precipitation_sum', i),
      precipitationProbabilityPct: at('precipitation_probability_max', i),
      condition: conditionFromWmo(at('weather_code', i)),
    })),
  };
}
