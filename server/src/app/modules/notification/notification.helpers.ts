import { INotification } from '@/app/schemas/modules/notification/notification.interface';

// DRY: both createNotification and sendGeneralNotification emit the same socket event
export const emitSocketNotification = (
  traceId: string,
  payload: Partial<INotification>
): void => {
  // @ts-ignore — socketio is attached to global in app bootstrap
  const io = global?.socketio;
  if (!io) return;

  try {
    const channel = `notification::${payload.receiver}`;
    io.emit(channel, payload);
  } catch (err) {
    console.error(`[${traceId}] Socket emit failed:`, err);
  }
};
