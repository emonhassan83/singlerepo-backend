import { HttpStatusCode } from 'axios';

import {
  createOtpToken,
  deleteOtpFromRedis,
  generateOtp,
  getOtpFromRedis,
  hashOtp,
  saveOtpToRedis,
  sendOtpEmail,
  sendOtpSms,
  updateUserOtpStatus,
  verifyOtpHash,
  verifyOtpToken,
} from './otp.helpers';

import ApiError from '@/app/errors/ApiError';
import { generateTokens } from '@/app/modules/auth/auth.helpers';
import { findUserById, findUserByPhone, validateUserExists } from '@/app/modules/user/user.helpers';

// ─── Verify OTP ────────────────────────────────────────────────────────────
// S (SRP): owns only verification decision — token decode, Redis check, DB update

export const verifyOTP = async (
  traceId: string,
  tokenWithBearer: string,
  otp: string | number,
  query: Record<string, unknown>
) => {
  const { type } = query;

  const decoded = verifyOtpToken(tokenWithBearer, traceId);
  const { email } = decoded;

  if (!email) {
    throw new ApiError(HttpStatusCode.BadRequest, 'Email is required', traceId);
  }

  const storedHash = await getOtpFromRedis(email);
  if (!storedHash) {
    throw new ApiError(HttpStatusCode.Forbidden, 'OTP has expired. Please resend it', traceId);
  }

  const isMatch = await verifyOtpHash(otp.toString(), storedHash);
  if (!isMatch) {
    throw new ApiError(HttpStatusCode.BadRequest, 'Invalid OTP', traceId);
  }

  await deleteOtpFromRedis(email);

  const { user, responseData } = await updateUserOtpStatus(email, type as string, traceId);

  if (['login', 'signup', 'forgot'].includes(type as string)) {
    const tokens = generateTokens(user);
    return { message: `OTP verified for ${type}`, data: tokens };
  }

  return { message: `OTP verified for ${type}`, data: responseData };
};

// ─── Send OTP via Email ────────────────────────────────────────────────────

export const sendOtpInEmail = async (
  traceId: string,
  userId: string,
  email: string
) => {
  const user = await findUserById(userId);
  validateUserExists(user, traceId);

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

  await saveOtpToRedis(user!.email, hashedOtp);
  await sendOtpEmail(email, user!.name, otp);

  const token = createOtpToken({ email: user!.email, userId: user!._id.toString() });
  return { verificationToken: token };
};

// ─── Send OTP via Phone (authenticated — token in header) ──────────────────

export const sendOtpViaTokenInPhone = async (
  traceId: string,
  userId: string,
  payload: { phone: string }
) => {
  const { phone } = payload;

  const user = await findUserById(userId);
  validateUserExists(user, traceId);

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

  await saveOtpToRedis(user!.email, hashedOtp);
  await sendOtpSms(phone, otp, traceId);

  const token = createOtpToken({
    userId: user!._id.toString(),
    email: user!.email,
    role: user!.role,
  });

  return { verificationToken: token };
};

// ─── Send OTP via Phone (unauthenticated — phone number directly) ───────────

export const sendOtpViaDirectPhone = async (
  traceId: string,
  payload: { phone: string }
) => {
  const { phone } = payload;

  const user = await findUserByPhone(phone);
  validateUserExists(user, traceId);

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

  await saveOtpToRedis(user!.email, hashedOtp);
  await sendOtpSms(phone, otp, traceId);

  const token = createOtpToken({
    userId: user!._id.toString(),
    email: user!.email,
    role: user!.role,
  });

  return { token };
};

export const OtpServices = {
  verifyOTP,
  sendOtpInEmail,
  sendOtpViaTokenInPhone,
  sendOtpViaDirectPhone,
};
