import { HttpStatusCode } from 'axios';
import Jwt, { sign, verify } from 'jsonwebtoken';
import { Types } from 'mongoose';

import { env } from '@/app/configs/env.configs';
import ApiError from '@/app/errors/ApiError';
import { TExpiresIn } from '@/app/modules/auth/auth.interface';
import {
  checkUserExists,
  createUser,
  restoreUser,
  updateUnverifiedUser,
  validateUserCreation,
} from '@/app/modules/user/user.helpers';
import { ISignUpWithEmail, IUser } from '@/app/schemas/modules/user/user.interface';

// ─── JWT ───────────────────────────────────────────────────────────────────

export const createToken = (
  jwtPayload: { userId: Types.ObjectId; email: string; role: string },
  secret: string,
  expiresIn: TExpiresIn
) => sign(jwtPayload, secret, { expiresIn });

export const verifyToken = (token: string, secret: string) =>
  verify(token, secret) as Jwt.JwtPayload;

// Single definition — otp.helpers was using generateAuthTokens (same logic, now removed)
export const generateTokens = (user: IUser) => {
  const jwtPayload = { userId: user._id, email: user.email, role: user.role };

  const userResponse = {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    registerWith: user.registerWith,
  };

  const accessToken = createToken(
    jwtPayload,
    env.JWT_ACCESS_TOKEN_SECRET_KEY as string,
    env.JWT_ACCESS_EXPIRATION_TIME as TExpiresIn
  );

  const refreshToken = createToken(
    jwtPayload,
    env.JWT_REFRESH_TOKEN_SECRET_KEY as string,
    env.JWT_REFRESH_EXPIRATION_TIME as TExpiresIn
  );

  return { user: userResponse, accessToken, refreshToken };
};

// ─── Signup orchestration ──────────────────────────────────────────────────

// S (SRP): processSignup owns the "create or return existing user" decision only.
// Token generation, OTP sending — handled by callers (auth.services.ts).
export const handleDuplicateUser = async (
  email: string,
  phone: string,
  payload: Partial<ISignUpWithEmail>,
  traceId: string
) => {
  const existingUser = await checkUserExists(email, phone);

  if (!existingUser) {
    return { shouldProceed: true };
  }

  if (!existingUser.isDeleted && existingUser.isSignUpOtpVerified) {
    const message =
      existingUser.email === email
        ? 'User already exists with this email'
        : 'User already exists with this phone number';

    throw new ApiError(HttpStatusCode.Forbidden, message, traceId);
  }

  if (existingUser.isDeleted) {
    await restoreUser(existingUser._id.toString(), { email, phone, ...payload }, traceId);
  } else {
    await updateUnverifiedUser(existingUser._id.toString(), { email, phone, ...payload }, traceId);
  }

  return { shouldProceed: true };
};

export const processSignup = async (payload: ISignUpWithEmail, traceId: string) => {
  const { email, phone } = payload;

  const existingUser = await checkUserExists(email, phone);

  if (existingUser) {
    if (!existingUser.isDeleted && existingUser.isSignUpOtpVerified) {
      const message =
        existingUser.email === email
          ? 'User already exists with this email'
          : 'User already exists with this phone number';
      throw new ApiError(HttpStatusCode.Forbidden, message, traceId);
    }

    // Soft-deleted → restore; unverified → update fields
    if (existingUser.isDeleted) {
      await restoreUser(existingUser._id.toString(), payload, traceId);
    } else {
      await updateUnverifiedUser(existingUser._id.toString(), payload, traceId);
    }

    return existingUser;
  }

  const user = await createUser(payload);
  validateUserCreation(user, traceId);
  return user;
};
