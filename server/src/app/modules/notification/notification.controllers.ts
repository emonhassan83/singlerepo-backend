import { NotificationService } from './notification.services';

import { getTraceId } from '@/app/configs/requestContext.configs';
import { asyncHandler, sendResponse } from '@/app/utils/system.utils';

const createNotification = asyncHandler(async (req, res) => {
  const traceId = getTraceId();
  const result = await NotificationService.createNotificationIntoDB(
    traceId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification create successfully!',
    data: result,
    traceId,
  });
});

const sentGeneralNotification = asyncHandler(async (req, res) => {
  const traceId = getTraceId();
  const result = await NotificationService.sendGeneralNotificationIntoDB(
    traceId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'General notification create successfully!',
    data: result,
    traceId,
  });
});

const getAllNotifications = asyncHandler(async (req, res) => {
  req.query['receiver'] = req.user._id;
  const traceId = getTraceId();
  const result = await NotificationService.getAllNotificationFromDB(
    traceId,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notifications retrieved successfully!',
    meta: result.meta,
    data: result.result,
    traceId,
  });
});

const markAsDoneNotification = asyncHandler(async (req, res) => {
  const traceId = getTraceId();
  const result = await NotificationService.markAsDoneFromDB(
    traceId,
    req?.user?._id
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification marked as read successfully',
    data: result,
    traceId,
  });
});

const deleteANotification = asyncHandler(async (req, res) => {
  const traceId = getTraceId();
  const result = await NotificationService.deleteANotificationFromDB(
    traceId,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notification delete successfully!',
    data: result,
    traceId,
  });
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  const traceId = getTraceId();
  const result = await NotificationService.deleteAllNotificationsFromDB(
    traceId,
    req.user._id
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Notifications delete successfully!',
    data: result,
    traceId,
  });
});

export const NotificationControllers = {
  createNotification,
  sentGeneralNotification,
  getAllNotifications,
  markAsDoneNotification,
  deleteANotification,
  deleteAllNotifications,
};
