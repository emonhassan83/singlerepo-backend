import admin from 'firebase-admin';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirebaseCredentials } from '@/app/utils/system.utils';

const credentials = getFirebaseCredentials();
const hasFirebaseConfig = !!(
  credentials.project_id &&
  credentials.client_email &&
  credentials.private_key
);

let messagingInstance: any = null;

if (hasFirebaseConfig) {
  try {
    const apps = getApps();
    let firebaseApp;

    if (!apps.length) {
      firebaseApp = initializeApp({
        credential: cert(credentials as any),
      });
    } else {
      firebaseApp = apps[0];
    }

    messagingInstance = getMessaging(firebaseApp);
    console.log('🔥 [Firebase] Firebase Admin initialized successfully');
  } catch (error) {
    console.error('🔥 [Firebase] Initialization failed:', error);
    messagingInstance = null;
  }
}

if (!messagingInstance) {
  console.warn('⚠️ [Firebase] Credentials missing or initialization failed. Push notifications will be mocked.');
  messagingInstance = {
    send: async (msg: any) => {
      console.log('🤖 [Mock Firebase] send notification:', JSON.stringify(msg, null, 2));
      return 'mock-message-id';
    },
    sendEachForMulticast: async (msg: any) => {
      console.log('🤖 [Mock Firebase] sendEachForMulticast notifications:', JSON.stringify(msg, null, 2));
      return {
        responses: msg.tokens.map(() => ({ success: true, messageId: 'mock-multicast-id' })),
        successCount: msg.tokens.length,
        failureCount: 0,
      };
    },
  };
}

export const messaging = messagingInstance;
export default messagingInstance && getApps().length > 0 ? getApps()[0] : null;
