/**
 * An error that maps directly to an HTTP response. Throw (or pass to next()) from any route,
 * service or middleware; the central error handler turns it into the standard error body.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
