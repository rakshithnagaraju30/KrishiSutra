import type { RequestHandler } from 'express';
import { currentUserId } from '../middleware/auth.ts';
import type { AuthService } from '../services/auth.service.ts';
import { sendSuccess } from '../utils/response.ts';
import type { RegisterDeviceBody, UpdateMeBody } from '../validators/auth.schemas.ts';

export function createAuthController(auth: AuthService) {
  const registerDevice: RequestHandler = async (req, res) => {
    sendSuccess(res, await auth.registerDevice(req.body as RegisterDeviceBody), 201);
  };
  const getMe: RequestHandler = async (req, res) => {
    sendSuccess(res, await auth.getProfile(currentUserId(req)));
  };
  const updateMe: RequestHandler = async (req, res) => {
    sendSuccess(res, await auth.updateProfile(currentUserId(req), req.body as UpdateMeBody));
  };
  return { registerDevice, getMe, updateMe };
}
