import { HttpStatusCode } from 'axios';

import { emitSocketNotification } from './notification.helpers';

import QueryBuilder from '@/app/builder/QueryBuilder';
import ApiError from '@/app/errors/ApiError';
import { decrementUnreadCount, setUnreadCountInRedis } from '@/app/redis/helpers/notification';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import { User } from '@/app/modules/user/user.model';

// ─── Create ────────────────────────────────────────────────────────────────

const createNotificationIntoDB = async (traceId: string, payload: INotification) => {
  const notification = await Notification.create(payload);
  if (!notification) {
    throw new ApiError(HttpStatusCode.Conflict, 'Notification not created!', traceId);
  }

  emitSocketNotification(traceId, payload);
  return notification;
};

const sendGeneralNotificationIntoDB = async (traceId: string, payload: INotification) => {
  // Exclude receiver from rest so the explicit userId assignment below is the only source
  const { message, description, receiver: _originalReceiver, ...rest } = payload;

  const userIds = (await User.distinct('_id', { role: 'user' })).map((id: any) =>
    id.toString()
  );

  const notifications = userIds.map((userId: string) => ({
    ...rest,
    receiver: userId,
    message,
    description,
  }));

  const result = await Notification.insertMany(notifications);
  if (!result?.length) {
    throw new ApiError(HttpStatusCode.Conflict, 'Notifications not created!', traceId);
  }

  // Emit to all receivers in parallel (fire and forget)
  userIds.forEach((userId: string) =>
    emitSocketNotification(traceId, { ...payload, receiver: userId })
  );
};

// ─── Read ──────────────────────────────────────────────────────────────────

const getAllNotificationFromDB = async (
  _traceId: string,
  query: Record<string, unknown>
) => {
  const notificationQuery = new QueryBuilder(Notification.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  // Run query and count in parallel
  const [result, meta] = await Promise.all([
    notificationQuery.modelQuery,
    notificationQuery.countTotal(),
  ]);

  return { meta, result };
};

// ─── Update ────────────────────────────────────────────────────────────────

const markAsDoneFromDB = async (_traceId: string, userId: string) => {
  const result = await Notification.updateMany(
    { receiver: userId },
    { $set: { read: true } }
  );

  if (result.modifiedCount > 0) {
    await setUnreadCountInRedis(userId, 0);
  }

  return result;
};

// ─── Delete ────────────────────────────────────────────────────────────────

const deleteANotificationFromDB = async (traceId: string, id: string) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(HttpStatusCode.NotFound, 'Notification not found!', traceId);
  }

  const wasUnread = !notification.read;
  const deleted = await Notification.findByIdAndDelete(id);

  if (wasUnread && deleted) {
    await decrementUnreadCount(notification.receiver!.toString());
  }

  return deleted;
};

const deleteAllNotificationsFromDB = async (traceId: string, userId: string) => {
  const [unreadCount, result] = await Promise.all([
    Notification.countDocuments({ receiver: userId, read: false }),
    Notification.deleteMany({ receiver: userId }),
  ]);

  if (result.deletedCount === 0) {
    throw new ApiError(HttpStatusCode.NotFound, 'No notifications found!', traceId);
  }

  if (unreadCount > 0) {
    await decrementUnreadCount(userId, unreadCount);
  }

  return result;
};

export const NotificationService = {
  createNotificationIntoDB,
  sendGeneralNotificationIntoDB,
  getAllNotificationFromDB,
  markAsDoneFromDB,
  deleteANotificationFromDB,
  deleteAllNotificationsFromDB,
};
