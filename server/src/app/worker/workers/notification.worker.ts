import { Worker, Job } from 'bullmq';
import { getRedisClient } from '@/app/configs/redis.config';
import { Notification } from '@/app/modules/notification/notification.model';
import { emitSocketNotification } from '@/app/modules/notification/notification.helpers';
import { messaging } from '@/app/configs/firebase.configs';

export const initializeNotificationWorker = () => {
  const connection = getRedisClient();

  const worker = new Worker(
    'notification-queue',
    async (job: Job) => {
      const { traceId, channel, title, message, data } = job.data;
      console.log(`[Notification Worker] Processing ${job.name} (channel: ${channel})`);

      try {
        if (job.name === 'send-notification') {
          const { userId, fcmToken } = job.data;

          // 1. Socket notification (Save to DB & emit socket)
          if (channel === 'socket' || channel === 'both') {
            await Notification.create({
              receiver: userId,
              message: title,
              description: message,
              modelType: data?.modelType,
              reference: data?.reference,
            });

            emitSocketNotification(traceId, {
              receiver: userId,
              message: title,
              description: message,
              modelType: data?.modelType,
              reference: data?.reference,
            });
            console.log(`[Notification Worker] Socket notification sent & saved to DB for user ${userId}`);
          }

          // 2. Push notification (FCM)
          if (channel === 'push' || channel === 'both') {
            if (fcmToken) {
              try {
                const stringifiedData = data
                  ? Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: String(data[key]) }), {})
                  : undefined;

                await messaging.send({
                  token: fcmToken,
                  notification: {
                    title,
                    body: message,
                  },
                  data: stringifiedData,
                });
                console.log(`[Notification Worker] Push notification sent to FCM token for user ${userId}`);
              } catch (firebaseError) {
                console.warn(`[Notification Worker] Firebase FCM send failed:`, firebaseError instanceof Error ? firebaseError.message : firebaseError);
              }
            } else {
              console.log(`[Notification Worker] FCM token missing, skipped push notification for user ${userId}`);
            }
          }
        } else if (job.name === 'send-batch-notification') {
          const { userIds, fcmTokens } = job.data;

          // 1. Batch Socket notification
          if (channel === 'socket' || channel === 'both') {
            const notifications = userIds.map((userId: string) => ({
              receiver: userId,
              message: title,
              description: message,
              modelType: data?.modelType,
              reference: data?.reference,
            }));

            await Notification.insertMany(notifications);

            userIds.forEach((userId: string) => {
              emitSocketNotification(traceId, {
                receiver: userId,
                message: title,
                description: message,
                modelType: data?.modelType,
                reference: data?.reference,
              });
            });
            console.log(`[Notification Worker] Batch socket notifications sent & saved to DB for ${userIds.length} users`);
          }

          // 2. Batch Push notification
          if (channel === 'push' || channel === 'both') {
            if (fcmTokens && fcmTokens.length > 0) {
              try {
                const stringifiedData = data
                  ? Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: String(data[key]) }), {})
                  : undefined;

                await messaging.sendEachForMulticast({
                  tokens: fcmTokens,
                  notification: {
                    title,
                    body: message,
                  },
                  data: stringifiedData,
                });
                console.log(`[Notification Worker] Batch push notification sent to ${fcmTokens.length} FCM tokens`);
              } catch (firebaseError) {
                console.warn(`[Notification Worker] Firebase Multicast FCM send failed:`, firebaseError instanceof Error ? firebaseError.message : firebaseError);
              }
            } else {
              console.log(`[Notification Worker] FCM tokens missing/empty, skipped batch push notification`);
            }
          }
        }
      } catch (error) {
        console.error(`[Notification Worker] Job ${job.id} failed processing:`, error);
        throw error;
      }
    },
    {
      connection: connection as any,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Notification Worker] Job ${job?.id} failed:`, err);
  });

  console.log('[Notification Worker] Notification worker initialized');
  return worker;
};
