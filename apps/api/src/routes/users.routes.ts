/**
 * Phone sign-in (public, rate-limited per IP), the signed-in user's profile, and administrator
 * role management (ADMIN only — roles are checked from the database by requireRole).
 */
import { Router, type RequestHandler } from 'express';
import { createPhoneAuthController } from '../controllers/phone-auth.controller.ts';
import { createUserController } from '../controllers/user.controller.ts';
import { requireRole } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';
import type { PhoneAuthService } from '../services/phone-auth.service.ts';
import type { UserService } from '../services/user.service.ts';
import {
  findUserQuery, grantRoleBody, loginBody, logoutBody, refreshBody, registerBody, sendOtpBody, updateProfileBody,
  userIdParams, userRoleParams, verifyOtpBody,
} from '../validators/auth.schemas.ts';

export function createUsersRouter(deps: { phone: PhoneAuthService; users: UserService; requireAuth: RequestHandler; otpLimiter: RequestHandler }): Router {
  const r = Router();
  const a = createPhoneAuthController(deps.phone);
  const u = createUserController(deps.users);

  r.post('/auth/register', deps.otpLimiter, validate({ body: registerBody }), a.register);
  r.post('/auth/send-otp', deps.otpLimiter, validate({ body: sendOtpBody }), a.sendOtp);
  r.post('/auth/verify-otp', deps.otpLimiter, validate({ body: verifyOtpBody }), a.verifyOtp);
  r.post('/auth/login', deps.otpLimiter, validate({ body: loginBody }), a.login);
  r.post('/auth/refresh', validate({ body: refreshBody }), a.refresh);
  r.post('/auth/logout', validate({ body: logoutBody }), a.logout);

  r.get('/users/me', deps.requireAuth, u.getMe);
  r.patch('/users/me', deps.requireAuth, validate({ body: updateProfileBody }), u.updateMe);

  const admin = [deps.requireAuth, requireRole('ADMIN')];
  r.get('/admin/users', ...admin, validate({ query: findUserQuery }), u.findByPhone);
  r.get('/admin/users/:id', ...admin, validate({ params: userIdParams }), u.getUser);
  r.post('/admin/users/:id/roles', ...admin, validate({ params: userIdParams, body: grantRoleBody }), u.grantRole);
  r.delete('/admin/users/:id/roles/:role', ...admin, validate({ params: userRoleParams }), u.revokeRole);
  return r;
}
