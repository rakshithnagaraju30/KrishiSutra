/**
 * Loads data from the API with an offline copy on the phone.
 *
 * 1. Shows the saved copy at once (if any) — so guides work without network.
 * 2. Fetches fresh data; on success it replaces the copy.
 * 3. If the fetch fails but a copy exists, the copy stays on screen with `offline: true`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './client';

const PREFIX = 'krishisutra.cache:';

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as { data: T }).data : null;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage full or unavailable: the app still works online.
  }
}

export type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  /** Showing the saved copy because the server could not be reached. */
  offline: boolean;
  reload: () => void;
};

/** `key` null = do not load yet. The cache key should include anything that changes the data (e.g. language). */
export function useApi<T>(key: string | null, fetcher: () => Promise<T>, opts: { cache?: boolean } = {}): ApiState<T> {
  const cache = opts.cache ?? true;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(key));
  const [error, setError] = useState<ApiError | null>(null);
  const [offline, setOffline] = useState(false);
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!key) return;
    let alive = true;
    let hadCopy = false;
    setLoading(true);
    setError(null);
    (async () => {
      if (cache) {
        const copy = await readCache<T>(key);
        if (copy !== null && alive) {
          hadCopy = true;
          setData(copy);
        }
      }
      try {
        const fresh = await fetcherRef.current();
        if (!alive) return;
        setData(fresh);
        setOffline(false);
        if (cache) await writeCache(key, fresh);
      } catch (e) {
        if (!alive) return;
        const err = e instanceof ApiError ? e : new ApiError(0, 'UNKNOWN', String(e));
        if (hadCopy && err.isNetwork) setOffline(true);
        else setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [key, nonce, cache]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, loading, error, offline, reload };
}
