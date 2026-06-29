import { Request, Response } from 'express';

import { env } from '@/app/configs/env.configs';
import { getTraceId } from '@/app/configs/requestContext.configs';
import { AuthService } from '@/app/modules/auth/auth.services';
import { asyncHandler, sendResponse } from '@/app/utils/system.utils';

// DRY: single place for refresh-token cookie config
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
};

// ─── Signup ────────────────────────────────────────────────────────────────

const signupWithEmail = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await AuthService.signupWithEmail(traceId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User created successfully, please verify your otp',
    data,
    traceId,
  });
});

const signupWithPhone = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await AuthService.signupWithPhone(traceId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User created successfully, please verify your otp',
    data,
    traceId,
  });
});

// ─── Social Auth ───────────────────────────────────────────────────────────

const registerWithGoogle = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const result = await AuthService.registerWithGoogle(traceId, req.body);
  setRefreshTokenCookie(res, result.refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Logged in successfully',
    data: result,
    traceId,
  });
});

const registerWithApple = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const result = await AuthService.registerWithApple(traceId, req.body);
  setRefreshTokenCookie(res, result.refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Logged in successfully',
    data: result,
    traceId,
  });
});

// ─── Login ─────────────────────────────────────────────────────────────────

const loginWithEmail = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const result = await AuthService.loginWithEmail(traceId, req.body);
  setRefreshTokenCookie(res, result.refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Logged in successfully',
    data: result,
    traceId,
  });
});

const loginWithPhone = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await AuthService.loginWithPhone(traceId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OTP sent to your phone number',
    data,
    traceId,
  });
});

// ─── Password ──────────────────────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await AuthService.forgotPassword(traceId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OTP sent to your email for password reset',
    data,
    traceId,
  });
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  await AuthService.resetPassword(traceId, req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Password reset successfully',
    data: null,
    traceId,
  });
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  await AuthService.changePassword(traceId, req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Password changed successfully',
    data: null,
    traceId,
  });
});

// ─── Session ───────────────────────────────────────────────────────────────

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  await AuthService.logoutUser(traceId, req.user.userId);
  res.clearCookie('refreshToken');

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Logged out successfully',
    data: null,
    traceId,
  });
});

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await AuthService.refreshToken(traceId, req.cookies?.refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Token refreshed successfully',
    data,
    traceId,
  });
});

export const AuthControllers = {
  signupWithEmail,
  signupWithPhone,
  registerWithGoogle,
  registerWithApple,
  loginWithEmail,
  loginWithPhone,
  forgotPassword,
  resetPassword,
  changePassword,
  logoutUser,
  refreshToken,
};
