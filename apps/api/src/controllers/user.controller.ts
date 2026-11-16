import type { RequestHandler } from 'express';
import { currentUserId } from '../middleware/auth.ts';
import { getValidated } from '../middleware/validate.ts';
import type { UserService } from '../services/user.service.ts';
import { sendSuccess } from '../utils/response.ts';
import type { UpdateProfileBody } from '../validators/auth.schemas.ts';

export function createUserController(users: UserService) {
  const getMe: RequestHandler = async (req, res) => {
    sendSuccess(res, await users.getProfile(currentUserId(req)));
  };
  const updateMe: RequestHandler = async (req, res) => {
    sendSuccess(res, await users.updateProfile(currentUserId(req), req.body as UpdateProfileBody));
  };
  // ---- administrators
  const findByPhone: RequestHandler = async (_req, res) => {
    const { query } = getValidated<{ query: { phone: string } }>(res);
    sendSuccess(res, await users.findByPhone(query.phone));
  };
  const getUser: RequestHandler = async (_req, res) => {
    const { params } = getValidated<{ params: { id: string } }>(res);
    sendSuccess(res, await users.getUser(params.id));
  };
  const grantRole: RequestHandler = async (req, res) => {
    const { params } = getValidated<{ params: { id: string } }>(res);
    sendSuccess(res, await users.grantRole(currentUserId(req), params.id, (req.body as { role: string }).role));
  };
  const revokeRole: RequestHandler = async (req, res) => {
    const { params } = getValidated<{ params: { id: string; role: string } }>(res);
    sendSuccess(res, await users.revokeRole(currentUserId(req), params.id, params.role));
  };
  return { getMe, updateMe, findByPhone, getUser, grantRole, revokeRole };
}
