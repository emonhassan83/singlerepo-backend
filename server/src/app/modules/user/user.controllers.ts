import { Request, Response } from 'express';

import { UserService } from './user.services';

import { getTraceId } from '@/app/configs/requestContext.configs';
import { asyncHandler, sendResponse } from '@/app/utils/system.utils';

// ─── Read ──────────────────────────────────────────────────────────────────

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UserService.getAllUsersFromDB(traceId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users fetched successfully',
    data,
    traceId,
  });
});

const getAUser = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UserService.getSingleUser(traceId, req.params.userId as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User fetched successfully',
    data,
    traceId,
  });
});

// ─── Update ────────────────────────────────────────────────────────────────

const changedEmail = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UserService.changeEmail(traceId, req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Email changed successfully',
    data,
    traceId,
  });
});

const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UserService.updateUserProfile(traceId, req.params.userId as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Profile updated successfully',
    data,
    traceId,
  });
});

const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UserService.updateUserStatus(traceId, req.params.userId as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User status updated successfully',
    data,
    traceId,
  });
});

const updateMyLocation = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UserService.updateLocationFromDB(traceId, req.user.userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Location updated successfully',
    data,
    traceId,
  });
});

// ─── Delete ────────────────────────────────────────────────────────────────

const deleteUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UserService.deleteUserProfile(traceId, req.params.userId as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Account deleted successfully',
    data,
    traceId,
  });
});

export const UserControllers = {
  getAllUsers,
  getAUser,
  changedEmail,
  updateUserProfile,
  updateUserStatus,
  updateMyLocation,
  deleteUserProfile,
};
