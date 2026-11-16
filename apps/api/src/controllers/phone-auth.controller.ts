import type { RequestHandler } from 'express';
import { bearerToken } from '../middleware/auth.ts';
import type { PhoneAuthService } from '../services/phone-auth.service.ts';
import { sendSuccess } from '../utils/response.ts';
import type { LoginBody, RegisterBody, SendOtpBody, VerifyOtpBody } from '../validators/auth.schemas.ts';

export function createPhoneAuthController(phone: PhoneAuthService) {
  const register: RequestHandler = async (req, res) => {
    // An app with a device account sends its device token, so that account is upgraded (data kept).
    const token = bearerToken(req.headers.authorization);
    sendSuccess(res, await phone.register(req.body as RegisterBody, token?.startsWith('ks_dev_') ? token : null), 201);
  };
  const sendOtp: RequestHandler = async (req, res) => {
    sendSuccess(res, await phone.sendOtp(req.body as SendOtpBody));
  };
  const verifyOtp: RequestHandler = async (req, res) => {
    sendSuccess(res, await phone.verifyRegistration(req.body as VerifyOtpBody));
  };
  const login: RequestHandler = async (req, res) => {
    sendSuccess(res, await phone.login(req.body as LoginBody));
  };
  const refresh: RequestHandler = async (req, res) => {
    sendSuccess(res, await phone.refresh((req.body as { refreshToken: string }).refreshToken));
  };
  const logout: RequestHandler = async (req, res) => {
    await phone.logout((req.body as { refreshToken: string }).refreshToken);
    sendSuccess(res, { loggedOut: true });
  };
  return { register, sendOtp, verifyOtp, login, refresh, logout };
}
