import type { RequestHandler } from 'express';
import { HttpError } from '../utils/http-error.ts';

/** Any request that reached the end of the router chain → 404 in the standard error format. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} was not found.`));
};
