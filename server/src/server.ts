import { createServer, type Server } from 'node:http';

import { config } from 'dotenv';

import app from '@/app';
import { connectDatabase } from '@/app/configs/db.configs';
import { connectRedis } from '@/app/configs/redis.config';
import initializeSocketIO from '@/app/socket/socket.init';
import { shutdown } from '@/app/utils/shutdown.utils';
import { startWorkers } from '@/app/worker';
import { startCronJobs } from '@/app/jobs';

config();

const port: number = Number(process.env.PORT) || 5000;
const server: Server = createServer(app);
export const io = initializeSocketIO(server);

async function main(): Promise<void> {
  await connectRedis();
  await connectDatabase();

  // Start background workers and cron schedules
  startWorkers();
  startCronJobs();

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server ready!`);
    console.log(`🏠 Local:   http://localhost:${port}`);
    console.log(`🌐 Network: http://10.10.28.24:${port}`);
  });

  // @ts-ignore
  global.socketio = io;
}

main();

/**
 * Graceful signals
 */
process.on('SIGINT', () => shutdown({ reason: 'SIGINT', server }));
process.on('SIGTERM', () => shutdown({ reason: 'SIGTERM', server }));

/**
 * Fatal errors
 */
process.on('unhandledRejection', (error) =>
  shutdown({ reason: 'unhandledRejection', server, error })
);

process.on('uncaughtException', (error) =>
  shutdown({ reason: 'uncaughtException', server, error })
);
