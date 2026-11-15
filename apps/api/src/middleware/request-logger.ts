/**
 * Request id + access log.
 *
 * - Reuses a client-supplied `X-Request-Id` if it is a safe value, otherwise generates a UUID, and
 *   returns it in the `X-Request-Id` response header (useful for support and debugging).
 * - Logs one line per request: method, path (no query string), status and duration.
 *   Headers and bodies are not logged. Successful health checks are logged at debug level only.
 */
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { pinoHttp } from 'pino-http';
import type { Logger } from '../config/logger.ts';

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

/** Express rewrites req.url inside routers; originalUrl keeps the full path. Query strings are dropped. */
function pathOnly(req: { originalUrl?: string; url?: string }): string {
  return (req.originalUrl ?? req.url ?? '').split('?')[0] ?? '';
}

export function createRequestLogger(logger: Logger) {
  return pinoHttp({
    logger,
    genReqId(req: IncomingMessage, res: ServerResponse) {
      const header = req.headers['x-request-id'];
      const incoming = Array.isArray(header) ? header[0] : header;
      const id = incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    customLogLevel(req, res, error) {
      if (error || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      if (pathOnly(req).startsWith('/api/v1/health')) return 'debug';
      return 'info';
    },
    customSuccessMessage: (req, res, responseTime) => `${req.method} ${pathOnly(req)} ${res.statusCode} ${Math.round(responseTime)}ms`,
    customErrorMessage: (req, res) => `${req.method} ${pathOnly(req)} ${res.statusCode}`,
    serializers: {
      req: (req: { id?: unknown; method?: string; url?: string; raw?: { originalUrl?: string } }) => ({
        id: req.id,
        method: req.method,
        path: pathOnly({ originalUrl: req.raw?.originalUrl, url: req.url }),
      }),
      res: (res: { statusCode?: number }) => ({ statusCode: res.statusCode }),
    },
  });
}
