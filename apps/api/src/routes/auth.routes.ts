import { Router, type RequestHandler } from 'express';
import { createAuthController } from '../controllers/auth.controller.ts';
import { validate } from '../middleware/validate.ts';
import type { AuthService } from '../services/auth.service.ts';
import { registerDeviceBody, updateMeBody } from '../validators/auth.schemas.ts';

/** /auth/device (public, rate-limited) and /me (authenticated). */
export function createAuthRouter(deps: { auth: AuthService; requireAuth: RequestHandler; registrationLimiter: RequestHandler }): Router {
  const router = Router();
  const c = createAuthController(deps.auth);
  router.post('/auth/device', deps.registrationLimiter, validate({ body: registerDeviceBody }), c.registerDevice);
  router.get('/me', deps.requireAuth, c.getMe);
  router.patch('/me', deps.requireAuth, validate({ body: updateMeBody }), c.updateMe);
  return router;
}
