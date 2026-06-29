import dns from 'dns';
import mongoose from 'mongoose';

import { env } from '@/app/configs/env.configs';
import logger from '@/app/configs/logger.configs';

// Force Node.js to use public DNS servers for SRV lookups (fixes Docker Desktop DNS issues)
dns.setServers(['8.8.8.8', '1.1.1.1']);

console.log(env.MONGODB_URI);


mongoose.connection.on('error', (error) => {
  logger.error('[MongoDB] Connection error', { error });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('[MongoDB] Disconnected');
});

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
  console.log('[MongoDB] Connected');
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) return;

  await mongoose.disconnect();
  console.log('[MongoDB] Disconnected');
};

export default mongoose;
