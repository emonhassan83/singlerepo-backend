import { IBatchNotificationPayload, INotificationPayload } from '@/app/@types/system.types';
import { getTraceId } from '@/app/configs/requestContext.configs';
import { getNotificationQueue } from '@/app/queues/queues';

/**
 * Send Notification via Queue
 * Single Responsibility: Enqueue notification jobs for async processing
 */
export const sendNotificationViaQueue = async (payload: INotificationPayload) => {
  const traceId = getTraceId();
  const queue = getNotificationQueue();

  const jobData = {
    traceId,
    ...payload,
  };

  await queue.add('send-notification', jobData, {
    priority: 1,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  return { success: true, message: 'Notification queued successfully' };
};

/**
 * Send Batch Notification via Queue
 * Single Responsibility: Enqueue batch notification jobs for async processing
 */
export const sendBatchNotificationViaQueue = async (payload: IBatchNotificationPayload) => {
  const traceId = getTraceId();
  const queue = getNotificationQueue();

  const jobData = {
    traceId,
    ...payload,
  };

  await queue.add('send-batch-notification', jobData, {
    priority: 1,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  return { success: true, message: 'Batch notification queued successfully' };
};

/**
 * Send Push Notification via Queue
 * Convenience method for push-only notifications
 */
export const sendPushNotificationViaQueue = async (
  userId: string,
  fcmToken: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  return sendNotificationViaQueue({
    userId,
    channel: 'push',
    title,
    message,
    fcmToken,
    data,
  });
};

/**
 * Send Socket Notification via Queue
 * Convenience method for socket notifications (saves to DB only)
 */
export const sendSocketNotificationViaQueue = async (
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  return sendNotificationViaQueue({
    userId,
    channel: 'socket',
    title,
    message,
    data,
  });
};

/**
 * Send Both (Push + Socket) Notification via Queue
 * Convenience method for both push and socket notifications
 */
export const sendBothNotificationViaQueue = async (
  userId: string,
  fcmToken: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  return sendNotificationViaQueue({
    userId,
    channel: 'both',
    title,
    message,
    fcmToken,
    data,
  });
};