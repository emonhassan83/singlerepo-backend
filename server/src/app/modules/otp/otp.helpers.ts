import { HttpStatusCode } from 'axios';
import { compare, hash } from 'bcrypt';
import { JwtPayload, Secret, sign, verify } from 'jsonwebtoken';
import moment from 'moment';
import { generate } from 'otp-generator';
import twilio from 'twilio';

import { env } from '@/app/configs/env.configs';
import { OTP_GENERATE_CONFIG } from '@/app/constant';
import ApiError from '@/app/errors/ApiError';
import { createToken } from '@/app/modules/auth/auth.helpers';
import { TExpiresIn } from '@/app/modules/auth/auth.interface';
import { OtpRedisService } from '@/app/redis/helpers/otp';
import { User } from '@/app/modules/user/user.model';
import { getEmailQueueInstance } from '@/app/utils/queueHelper';

const OTP_EXPIRE = 60 * 5; // 5 minutes

// ─── OTP Generation & Hashing ──────────────────────────────────────────────
// S (SRP): these three only know about OTP math — no DB, no network

export const generateOtp = (length: number = 6): string =>
  generate(length, OTP_GENERATE_CONFIG);

export const hashOtp = async (otp: string): Promise<string> =>
  hash(otp.toString(), 10);

export const verifyOtpHash = async (plainOtp: string, hashedOtp: string): Promise<boolean> =>
  compare(plainOtp.toString(), hashedOtp);

// ─── OTP JWT ───────────────────────────────────────────────────────────────
// S (SRP): short-lived tokens used only during OTP verification flow

export const createOtpToken = (payload: { email: string; userId: string; role?: string }) =>
  sign(payload, env.JWT_ACCESS_TOKEN_SECRET_KEY as Secret, { expiresIn: '5m' });

export const verifyOtpToken = (tokenWithBearer: string, traceId: string): JwtPayload => {
  const token = tokenWithBearer.split(' ')[1];
  if (!token) {
    throw new ApiError(HttpStatusCode.Unauthorized, 'You are not authorized', traceId);
  }

  try {
    return verify(token, env.JWT_ACCESS_TOKEN_SECRET_KEY as Secret) as JwtPayload;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${traceId}] OTP token verification failed:`, msg);
    throw new ApiError(
      HttpStatusCode.Forbidden,
      'Session has expired. Please request a new OTP.',
      traceId
    );
  }
};

// ─── Redis ─────────────────────────────────────────────────────────────────
// S (SRP): Redis OTP storage — no business logic

export const saveOtpToRedis = async (email: string, hashedOtp: string): Promise<void> =>
  OtpRedisService.saveOtp(email, hashedOtp, OTP_EXPIRE);

export const getOtpFromRedis = async (email: string): Promise<string | null> =>
  OtpRedisService.getOtp(email);

export const deleteOtpFromRedis = async (email: string): Promise<void> =>
  OtpRedisService.deleteOtp(email);

// ─── User OTP status update ────────────────────────────────────────────────
// S (SRP): map OTP type → DB update fields; keep mapping logic in one place

const OTP_TYPE_UPDATE_MAP: Record<string, Record<string, any>> = {
  signup: { isSignUpOtpVerified: true, expireAt: null },
  forgot: { isResetPasswordVerified: true },
  login: { isLoginOTPVerified: true },
  changeEmail: { isChangeEmailOtpVerified: true },
  changePhone: { isChangePhoneOtpVerified: true },
};

// O (OCP): add a new OTP type → add one row to the map, no if/else changes needed
const OTP_TYPE_RESPONSE_MAP: Record<string, Record<string, any>> = {
  changeEmail: { isChangeEmailOtpVerified: true },
  changePhone: { isChangePhoneOtpVerified: true },
};

const getOtpTypeUpdateData = (type: string, traceId: string): Record<string, any> => {
  const data = OTP_TYPE_UPDATE_MAP[type];
  if (!data) {
    throw new ApiError(HttpStatusCode.BadRequest, `Invalid OTP type: ${type}`, traceId);
  }
  return data;
};

const getOtpTypeResponseData = (type: string): Record<string, any> =>
  OTP_TYPE_RESPONSE_MAP[type] ?? {};

export const updateUserOtpStatus = async (
  email: string,
  type: string,
  traceId: string
): Promise<{ user: any; responseData: Record<string, any> }> => {
  const updateData = getOtpTypeUpdateData(type, traceId);
  const responseData = getOtpTypeResponseData(type);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: updateData },
    { returnDocument: 'after' }
  ).lean();

  if (!user) {
    throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
  }

  return { user, responseData };
};

// ─── Token generation for OTP-verified responses ───────────────────────────
// Re-exports generateTokens from auth.helpers — single source of truth
export { generateTokens as generateAuthTokens } from '@/app/modules/auth/auth.helpers';

// ─── Delivery ──────────────────────────────────────────────────────────────
// S (SRP): each function owns ONE delivery mechanism

export const sendOtpEmail = async (
  email: string,
  userName: string,
  otp: string
): Promise<void> => {
  const expiresAt = moment().add(5, 'minute');
  const emailQueue = await getEmailQueueInstance();

  await emailQueue.add(
    'send-verification-email',
    { email, name: userName, otp, expiresAt: expiresAt.format('LT') },
    { priority: 1, attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
  );
};

export const sendOtpSms = async (
  phone: string,
  otp: string,
  traceId: string
): Promise<void> => {
  if (env.NODE_ENV !== 'production') {
    const expiresAt = moment().add(5, 'minute').format('YYYY-MM-DD HH:mm:ss');
    console.log(`[${traceId}] [MOCK OTP] Phone: ${phone} | Code: ${otp} | Expires: ${expiresAt}`);
    return;
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  try {
    await client.messages.create({
      body: `Welcome to Split Ride, your verification code is ${otp}. It expires in 5 minutes. Please do not share.`,
      from: env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  } catch (error) {
    console.error(`[${traceId}] Twilio SMS error:`, error);
    throw new ApiError(HttpStatusCode.InternalServerError, 'Failed to send OTP', traceId);
  }
};
