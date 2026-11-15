/**
 * Request validation approach (used by every business endpoint from Part 3.2 on).
 *
 * Each route declares zod schemas for the parts it accepts:
 *
 *   router.post('/farms', validate({ body: createFarmSchema }), controller.create)
 *
 * Invalid input → 400 VALIDATION_ERROR with one entry per problem ({ path, message, code }).
 * Valid, parsed values (with defaults and coercions applied) are available via getValidated(res);
 * the parsed body also replaces req.body so unknown fields never reach services.
 */
import type { RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../utils/http-error.ts';

type Part = 'body' | 'query' | 'params';
export type RequestSchemas = Partial<Record<Part, ZodType>>;
export type Validated = Partial<Record<Part, unknown>>;

export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    const validated: Validated = {};
    const problems: { path: string; message: string; code: string }[] = [];

    for (const part of ['params', 'query', 'body'] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (result.success) {
        validated[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          problems.push({ path: [part, ...issue.path.map(String)].join('.'), message: issue.message, code: issue.code });
        }
      }
    }

    if (problems.length > 0) {
      next(new HttpError(400, 'VALIDATION_ERROR', 'Request validation failed.', problems));
      return;
    }
    if (validated.body !== undefined) req.body = validated.body;
    res.locals.validated = validated;
    next();
  };
}

export function getValidated<T extends Validated>(res: Response): T {
  return (res.locals.validated ?? {}) as T;
}
