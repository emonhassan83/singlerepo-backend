import { HttpStatusCode } from 'axios';

import ApiError from '@/app/errors/ApiError';
import { NOTIFICATION_MODEL_TYPE } from '@/app/schemas/modules/notification/notification.constant';
import { ISignUpWithEmail, IGeoLocation, IUser } from '@/app/schemas/modules/user/user.interface';
import { User } from '@/app/schemas/modules/user/user.model';
import { sendBothNotificationViaQueue } from '@/app/utils/notification-queue.service';

// ─── Lean lookups — no throw, callers decide ───────────────────────────────

export const findUserById = async (userId: string) =>
  User.findById(userId).lean();

export const findUserByEmail = async (email: string) =>
  User.findOne({ email }).lean();

export const findUserByPhone = async (phone: string) =>
  User.findOne({ phone }).lean();

export const checkUserExists = async (email: string, phone: string) =>
  User.findOne({ $or: [{ email }, { phone }] }).lean();

// ─── Mutations ─────────────────────────────────────────────────────────────

export const createUser = async (payload: ISignUpWithEmail) =>
  User.create(payload);

export const updateUser = async (userId: string, data: Record<string, any>) =>
  User.findByIdAndUpdate(userId, data, { new: true });

export const softDeleteUser = async (userId: string) =>
  User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });

export const restoreUser = async (
  userId: string,
  data: Record<string, any>,
  traceId?: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
  user.set({ ...data, isDeleted: false });
  await user.save();
  return user;
};

export const updateUnverifiedUser = async (
  userId: string,
  data: Record<string, any>,
  traceId?: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
  user.set(data);
  await user.save();
  return user;
};

// ─── Validators — throw on violation ───────────────────────────────────────

// Single definition — was duplicated in auth.helpers and otp.helpers
export const validateUserExists = (user: any, traceId?: string): void => {
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
  }
};

export const validateUserCreation = (user: any, traceId?: string): void => {
  if (!user) {
    throw new ApiError(HttpStatusCode.BadRequest, 'User creation failed', traceId);
  }
};

// Throws if user not found or soft-deleted — used inside service functions
export const findActiveUserOrThrow = async (userId: string, traceId?: string) => {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
  }
  return user;
};

export const assertEmailNotTaken = async (
  email: string,
  excludeUserId: string,
  traceId?: string
) => {
  const exists = await User.findOne({ email, _id: { $ne: excludeUserId } });
  if (exists) {
    throw new ApiError(
      HttpStatusCode.Conflict,
      'This email is already in use by another account',
      traceId
    );
  }
};

export const assertPhoneNotTaken = async (
  phone: string,
  excludeUserId: string,
  traceId?: string
) => {
  const exists = await User.findOne({ phone, _id: { $ne: excludeUserId } });
  if (exists) {
    throw new ApiError(
      HttpStatusCode.Conflict,
      'This phone number is already in use',
      traceId
    );
  }
};

// ─── Pure utils ────────────────────────────────────────────────────────────

export const buildGeoLocation = (longitude: number, latitude: number): IGeoLocation => ({
  type: 'Point',
  coordinates: [longitude, latitude],
});

// ─── Firebase Push Notification Helpers ──────────────────────────────────────

/**
 * Update User FCM Token
 * Single Responsibility: Update user's Firebase Cloud Messaging token
 */
export const updateUserFcmToken = async (userId: string, fcmToken: string) => {
  return User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
};

/**
 * Get User FCM Token
 * Single Responsibility: Get user's FCM token for push notifications
 */
export const getUserFcmToken = async (userId: string): Promise<string | null> => {
  const user = await User.findById(userId).select('fcmToken').lean();
  return user?.fcmToken || null;
};

export const sendUserStatusNotifYToUser = async (
  status: 'active' | 'blocked' | 'pending',
  user: IUser
) => {
  if (!user || !user?._id || !user?.fcmToken) return;

  let message: string;
  let description: string;

  if (status === 'active') {
    message = '✅ Account Activated';
    description = 'Your account has been successfully activated. You can now access all available features.';
  } else if (status === 'blocked') {
    message = '🚫 Account Blocked';
    description = 'Your account has been blocked. Please contact support for further assistance.';
  } else {
    message = '⏳ Account Status Updated';
    description = 'Your account status has been updated.';
  }

  // Send notification via queue (async, non-blocking)
  await sendBothNotificationViaQueue(
    user._id.toString(),
    user.fcmToken,
    message,
    description,
    {
      modelType: NOTIFICATION_MODEL_TYPE.User,
      reference: user._id.toString(),
    }
  );
};
