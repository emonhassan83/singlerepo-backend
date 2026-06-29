import { Queue } from 'bullmq';

import { getNotificationQueue } from '@/app/queues/queues';

export type TNotificationChannel = 'socket' | 'push' | 'both';

export interface INotificationJob {
  traceId: string;
  channel: TNotificationChannel;
  receiver: string;          // userId
  receiverFcmToken?: string; // required when channel is 'push' or 'both'
  title: string;
  message: string;
  description?: string;
  data?: Record<string, any>; // extra payload forwarded to client
}

let _instance: Queue | null = null;

export const getNotificationQueueInstance = () => {
  if (!_instance) {
    _instance = getNotificationQueue();
  }
  return _instance;
};

export const resetNotificationQueueInstance = () => {
  _instance = null;
};

/**
 * Push a notification job onto the queue.
 *
 * Usage:
 *   // Socket only
 *   await enqueueNotification({ channel: 'socket', receiver: userId, title: '...', message: '...' })
 *
 *   // Push (FCM) only
 *   await enqueueNotification({ channel: 'push', receiver: userId, receiverFcmToken: token, title: '...', message: '...' })
 *
 *   // Both socket + push
 *   await enqueueNotification({ channel: 'both', receiver: userId, receiverFcmToken: token, title: '...', message: '...' })
 */
export const enqueueNotification = async (payload: INotificationJob) => {
  const queue = getNotificationQueueInstance();
  await queue.add('send-notification', payload, {
    priority: 1,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
};
