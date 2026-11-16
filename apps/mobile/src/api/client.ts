/**
 * KrishiSutra API client.
 *
 * - Server address: the default comes from app.json (`expo.extra.apiBaseUrl`) and can be changed in
 *   Settings (stored on the phone).
 * - Device account: the first call that needs it registers this phone (POST /auth/device) and keeps
 *   the returned token. No phone number or name is needed. Tokens are stored per server address.
 * - Responses follow `{ success, data }` / `{ success: false, error }`; errors become ApiError.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const SERVER_KEY = 'krishisutra.api.server';
const TOKEN_KEY = 'krishisutra.api.token:';
/** Free hosting sleeps when idle; the first request can take up to a minute to wake it. */
const TIMEOUT_MS = 70_000;

export const DEFAULT_SERVER: string =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ?? 'https://krishisutra-api.onrender.com';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
  /** True when the server could not be reached at all (no network, timeout, server asleep or down). */
  get isNetwork() {
    return this.status === 0;
  }
}

let serverCache: string | null = null;
let tokenPromise: Promise<string> | null = null;
let currentLanguage = 'en';

export function setApiLanguage(lang: string) {
  currentLanguage = lang;
}

export function normaliseServer(input: string): string {
  let s = input.trim().replace(/\/+$/, '');
  if (s && !/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s.replace(/\/api\/v1$/, '');
}

export async function getServer(): Promise<string> {
  if (serverCache) return serverCache;
  const saved = await AsyncStorage.getItem(SERVER_KEY).catch(() => null);
  serverCache = saved || DEFAULT_SERVER;
  return serverCache;
}

export async function setServer(url: string | null): Promise<void> {
  const value = url ? normaliseServer(url) : '';
  serverCache = value || DEFAULT_SERVER;
  tokenPromise = null;
  if (value && value !== DEFAULT_SERVER) await AsyncStorage.setItem(SERVER_KEY, value);
  else await AsyncStorage.removeItem(SERVER_KEY);
}

type RequestOptions = { method?: string; body?: unknown; auth?: boolean; server?: string };

async function rawRequest<T>(path: string, opts: RequestOptions, token: string | null): Promise<T> {
  const server = opts.server ?? (await getServer());
  const sep = path.includes('?') ? '&' : '?';
  const url = `${server}/api/v1${path}${sep}lang=${encodeURIComponent(currentLanguage)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: opts.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Could not reach the server.');
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 204) return undefined as T;
  let json: { success?: boolean; data?: T; error?: { code?: string; message?: string } } | null = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  if (!response.ok || !json?.success) {
    throw new ApiError(response.status, json?.error?.code ?? 'HTTP_ERROR', json?.error?.message ?? `Server error (${response.status}).`);
  }
  return json.data as T;
}

async function register(server: string): Promise<string> {
  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'web' ? 'web' : 'android';
  const data = await rawRequest<{ token: string }>('/auth/device', { method: 'POST', body: { platform, language: currentLanguage }, server }, null);
  await AsyncStorage.setItem(TOKEN_KEY + server, data.token);
  return data.token;
}

async function getToken(): Promise<string> {
  const server = await getServer();
  if (!tokenPromise) {
    tokenPromise = (async () => {
      const saved = await AsyncStorage.getItem(TOKEN_KEY + server).catch(() => null);
      return saved ?? (await register(server));
    })();
    tokenPromise.catch(() => {
      tokenPromise = null;
    });
  }
  return tokenPromise;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (!opts.auth) return rawRequest<T>(path, opts, null);
  const token = await getToken();
  try {
    return await rawRequest<T>(path, opts, token);
  } catch (error) {
    // The server no longer knows this token (e.g. its database was reset): register again once.
    if (error instanceof ApiError && error.status === 401) {
      const server = await getServer();
      await AsyncStorage.removeItem(TOKEN_KEY + server);
      tokenPromise = null;
      return rawRequest<T>(path, opts, await getToken());
    }
    throw error;
  }
}

/** Quick connectivity check used by Settings. */
export async function checkServer(server?: string): Promise<{ ok: boolean; latencyMs?: number }> {
  try {
    const data = await rawRequest<{ status: string; latencyMs?: number }>('/health/database', { server }, null);
    return { ok: data.status === 'ok', latencyMs: data.latencyMs };
  } catch {
    return { ok: false };
  }
}
