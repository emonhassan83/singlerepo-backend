import { HttpStatusCode } from 'axios';
import { hash } from 'bcrypt';

import { processSignup, generateTokens, createToken, verifyToken } from './auth.helpers';
import {
  TExpiresIn,
  TGoogleLoginPayload,
  TAppleLoginPayload,
  TLoginWithEmail,
  TLoginWithPhone,
} from './auth.interface';

import { env } from '@/app/configs/env.configs';
import { SALT_ROUNDS } from '@/app/constant';
import ApiError from '@/app/errors/ApiError';
import { OtpServices } from '@/app/modules/otp/otp.services';
import { REGISTER_WITH } from '@/app/modules/user/user.constant';
import { ISignUpWithEmail, ISignUpWithPhone } from '@/app/modules/user/user.interface';
import { User } from '@/app/modules/user/user.model';

// ─── Signup ────────────────────────────────────────────────────────────────

export const signupWithEmail = (traceId: string, payload: ISignUpWithEmail) =>
  processSignup(payload, traceId);

export const signupWithPhone = (traceId: string, payload: ISignUpWithPhone) =>
  processSignup(payload as ISignUpWithEmail, traceId);

// ─── Social Auth ───────────────────────────────────────────────────────────

// DRY core shared by Google + Apple — only provider string differs
const registerWithSocialAuth = async (
  traceId: string,
  provider: typeof REGISTER_WITH.google | typeof REGISTER_WITH.apple,
  payload: TGoogleLoginPayload | TAppleLoginPayload
) => {
  if (payload.role === 'admin') {
    throw new ApiError(HttpStatusCode.Forbidden, 'You cannot directly assign admin role', traceId);
  }

  const profileData = {
    name: payload.name,
    email: payload.email,
    photoUrl: payload.photoUrl,
    fcmToken: payload.fcmToken,
  };

  const user = await User.isUserExistsByEmail(payload.email as string);

  if (user) {
    if (user.registerWith !== provider) {
      throw new ApiError(
        HttpStatusCode.BadRequest,
        `This account is registered with ${user.registerWith}, please use that method.`,
        traceId
      );
    }

    const updatePayload = user.isDeleted
      ? { ...profileData, isDeleted: false, expireAt: null }
      : profileData;

    const updatedUser = await User.findByIdAndUpdate(user._id, updatePayload, {
      returnDocument: 'after',
    });

    if (user.isDeleted && !updatedUser) {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        'Failed to reactivate deleted user.',
        traceId
      );
    }

    return generateTokens((updatedUser ?? user) as any);
  }

  const newUser = await User.create({
    ...profileData,
    role: payload.role,
    registerWith: provider,
    expireAt: null as any,
  });

  if (!newUser) {
    throw new ApiError(HttpStatusCode.InternalServerError, 'Failed to create user!', traceId);
  }

  return generateTokens(newUser);
};

export const registerWithGoogle = (traceId: string, payload: TGoogleLoginPayload) =>
  registerWithSocialAuth(traceId, REGISTER_WITH.google, payload);

export const registerWithApple = (traceId: string, payload: TAppleLoginPayload) =>
  registerWithSocialAuth(traceId, REGISTER_WITH.apple, payload);

// ─── Login ─────────────────────────────────────────────────────────────────

export const loginWithEmail = async (traceId: string, payload: TLoginWithEmail) => {
  const { email, password, fcmToken } = payload;

  const user = await User.findOne({ email }).select('+password');
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'This user is not found!', traceId);
  }

  if (!(await User.isPasswordMatched(password, user.password))) {
    throw new ApiError(HttpStatusCode.Forbidden, 'Password do not matched', traceId);
  }

  if (!user.isSignUpOtpVerified) {
    throw new ApiError(HttpStatusCode.Forbidden, 'Your profile is not verified', traceId);
  }

  if (fcmToken) {
    await User.findByIdAndUpdate(user._id, { fcmToken });
  }

  return generateTokens(user as any);
};

// Phone login delegates OTP generation + SMS to OTP service (DRY — no duplicate logic here)
export const loginWithPhone = async (traceId: string, payload: TLoginWithPhone) => {
  const { phone, fcmToken } = payload;

  const user = await User.findOne({ phone });
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'This user is not found!', traceId);
  }

  if (!user.isSignUpOtpVerified) {
    throw new ApiError(HttpStatusCode.Forbidden, 'Your profile is not verified', traceId);
  }

  if (fcmToken) {
    await User.findByIdAndUpdate(user._id, { fcmToken, isLoginOTPVerified: false });
  }

  return OtpServices.sendOtpViaDirectPhone(traceId, { phone });
};

// ─── Password ──────────────────────────────────────────────────────────────

// Delegates OTP email to OTP service (DRY — no duplicate OTP logic here)
export const forgotPassword = async (traceId: string, payload: { email: string }) => {
  const { email } = payload;

  const user = await User.isUserExistsByEmail(email);
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'This user is not found!', traceId);
  }

  await User.findByIdAndUpdate(user._id, { isResetPasswordVerified: false });

  return OtpServices.sendOtpInEmail(traceId, user._id.toString(), email);
};

export const resetPassword = async (
  traceId: string,
  userId: string,
  payload: { password: string; confirmPassword: string }
) => {
  const { password, confirmPassword } = payload;

  if (password !== confirmPassword) {
    throw new ApiError(
      HttpStatusCode.BadRequest,
      'Password and Confirm Password not matched.',
      traceId
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
  }

  if (!user.isResetPasswordVerified) {
    throw new ApiError(
      HttpStatusCode.Forbidden,
      'Please complete OTP verification to reset your password.',
      traceId
    );
  }

  const newHashedPassword = await hash(password, SALT_ROUNDS);

  const updated = await User.findByIdAndUpdate(
    user._id,
    { $set: { password: newHashedPassword, passwordChangedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!updated) {
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      'Password was not reset. Please try again!',
      traceId
    );
  }
};

export const changePassword = async (
  traceId: string,
  userId: string,
  payload: { currentPassword: string; newPassword: string; confirmPassword: string }
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      HttpStatusCode.BadRequest,
      'New password and confirm password do not match.',
      traceId
    );
  }

  const user = await User.findById(userId).select('+password');
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'This user is not found!', traceId);
  }

  if (!(await User.isPasswordMatched(currentPassword, user.password))) {
    throw new ApiError(HttpStatusCode.Forbidden, 'Current password is incorrect.', traceId);
  }

  const newHashedPassword = await hash(newPassword, SALT_ROUNDS);

  await User.findByIdAndUpdate(user._id, {
    $set: { password: newHashedPassword, needsPasswordChange: false, passwordChangedAt: new Date() },
  });
};

// ─── Session ───────────────────────────────────────────────────────────────

export const logoutUser = async (traceId: string, userId: string) => {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'This user is not found!', traceId);
  }

  await User.findByIdAndUpdate(userId, { isLoginOTPVerified: false });
};

export const refreshToken = async (traceId: string, token: string) => {
  if (!token) {
    throw new ApiError(HttpStatusCode.Unauthorized, 'Refresh token is missing', traceId);
  }

  const decoded = verifyToken(token, env.JWT_REFRESH_TOKEN_SECRET_KEY as string);

  const user = await User.isUserExistsByEmail(decoded?.email);
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'This user is not found!', traceId);
  }

  const accessToken = createToken(
    { userId: user._id as any, email: user.email, role: user.role },
    env.JWT_ACCESS_TOKEN_SECRET_KEY as string,
    env.JWT_ACCESS_EXPIRATION_TIME as TExpiresIn
  );

  return { accessToken };
};

export const AuthService = {
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
