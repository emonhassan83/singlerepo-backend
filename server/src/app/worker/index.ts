import { initializeEmailWorker } from './workers/email.worker';
import { initializeNotificationWorker } from './workers/notification.worker';
import { initializeSystemWorker } from './workers/system.worker';

let emailWorker: any = null;
let notificationWorker: any = null;
let systemWorker: any = null;

export const startWorkers = () => {
  console.log('👷 [Workers] Starting background workers...');
  try {
    emailWorker = initializeEmailWorker();
    notificationWorker = initializeNotificationWorker();
    systemWorker = initializeSystemWorker();
    console.log('👷 [Workers] All workers started successfully');
  } catch (error) {
    console.error('👷 [Workers] Failed to start background workers:', error);
  }
};

export const stopWorkers = async () => {
  console.log('👷 [Workers] Stopping background workers...');
  try {
    if (emailWorker) await emailWorker.close();
    if (notificationWorker) await notificationWorker.close();
    if (systemWorker) await systemWorker.close();
    console.log('👷 [Workers] All workers stopped successfully');
  } catch (error) {
    console.error('👷 [Workers] Error stopping workers:', error);
  }
};
