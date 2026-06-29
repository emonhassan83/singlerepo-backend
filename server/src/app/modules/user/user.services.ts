import { HttpStatusCode } from 'axios';
import mongoose from 'mongoose';

import {
  assertEmailNotTaken,
  assertPhoneNotTaken,
  buildGeoLocation,
  findActiveUserOrThrow,
  sendUserStatusNotifYToUser,
} from './user.helpers';

import QueryBuilder from '@/app/builder/QueryBuilder';
import ApiError from '@/app/errors/ApiError';
import { generateTokens } from '@/app/modules/auth/auth.helpers';
import { IUserStatus, USER_ROLE } from '@/app/schemas/modules/user/user.constant';
import { IUser } from '@/app/schemas/modules/user/user.interface';
import { User } from '@/app/schemas/modules/user/user.model';

// ─── Read ──────────────────────────────────────────────────────────────────

const getAllUsersFromDB = async (_traceId: string, query: Record<string, unknown>) => {
  const usersQuery = new QueryBuilder(
    User.find({ isDeleted: false, role: { $ne: USER_ROLE.admin } }).select(
      '_id id name email profileImage role address status createdAt'
    ),
    query
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [users, meta] = await Promise.all([
    usersQuery.modelQuery,
    usersQuery.countTotal(),
  ]);

  return { meta, users };
};

const getSingleUser = async (traceId: string, userId: string): Promise<IUser | null> => {
  const user = await User.findById(userId).select('-expireAt -updatedAt -__v').lean();
  if (!user || user.isDeleted) {
    throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
  }
  return user as IUser;
};

// ─── Update ────────────────────────────────────────────────────────────────

const changeEmail = async (
  traceId: string,
  userId: string,
  payload: { email: string }
) => {
  const { email: newEmail } = payload;

  const user = await findActiveUserOrThrow(userId, traceId);

  if (!user.isChangeEmailOtpVerified) {
    throw new ApiError(HttpStatusCode.BadRequest, 'Please verify OTP first', traceId);
  }

  await assertEmailNotTaken(newEmail, userId, traceId);

  user.email = newEmail;
  user.isChangeEmailOtpVerified = false;
  await user.save();

  return generateTokens(user as any);
};

const updateUserProfile = async (
  traceId: string,
  userId: string,
  payload: Partial<IUser> & { latitude?: number; longitude?: number }
): Promise<Partial<IUser>> => {
  await findActiveUserOrThrow(userId, traceId);

  const updateData: Record<string, any> = { ...payload };

  if (payload.latitude && payload.longitude) {
    updateData.location = buildGeoLocation(payload.longitude, payload.latitude);
    delete updateData.latitude;
    delete updateData.longitude;
  }

  if (payload.phone) {
    const user = await User.findById(userId);
    if (payload.phone !== user?.phone) {
      if (!user?.isChangePhoneOtpVerified) {
        throw new ApiError(
          HttpStatusCode.BadRequest,
          'Please verify your new phone with OTP first',
          traceId
        );
      }
      await assertPhoneNotTaken(payload.phone, userId, traceId);
      updateData.isChangePhoneOtpVerified = false;
    }
  }

  const result = await User.findByIdAndUpdate(
    userId,
    { ...updateData, isProfileComplete: true },
    { returnDocument: 'after' }
  )
    .select('-expireAt -createdAt -updatedAt')
    .lean();

  if (!result) throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
  return result;
};

const updateUserStatus = async (
  traceId: string,
  userId: string,
  payload: { status: IUserStatus }
): Promise<IUser | null> => {
  await findActiveUserOrThrow(userId, traceId);

  const result = await User.findByIdAndUpdate(
    userId,
    { status: payload.status },
    { returnDocument: 'after' }
  ).select('name fcmToken email phone status isDeleted');

  if (!result) throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);

  // Send notification via queue (async, non-blocking)
  await sendUserStatusNotifYToUser(payload.status, result);
  
  return result;
};

const updateLocationFromDB = async (
  traceId: string,
  userId: string,
  payload: { longitude: number; latitude: number; address: string }
) => {
  const { longitude, latitude, address } = payload;

  await findActiveUserOrThrow(userId, traceId);

  return User.findByIdAndUpdate(
    userId,
    { location: buildGeoLocation(longitude, latitude), address },
    { returnDocument: 'after' }
  );
};

// ─── Delete ────────────────────────────────────────────────────────────────

const deleteUserProfile = async (traceId: string, userId: string): Promise<IUser | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user || user.isDeleted) {
      throw new ApiError(HttpStatusCode.NotFound, 'User not found', traceId);
    }

    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true, deletedAt: new Date() },
      {
        returnDocument: 'after',
        session,
        select: 'name email phone status isDeleted deletedAt',
      }
    );

    if (!deletedUser) {
      throw new ApiError(HttpStatusCode.InternalServerError, 'Failed to delete user', traceId);
    }

    await session.commitTransaction();
    return deletedUser;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const UserService = {
  getAllUsersFromDB,
  getSingleUser,
  changeEmail,
  updateUserProfile,
  updateUserStatus,
  updateLocationFromDB,
  deleteUserProfile,
};
