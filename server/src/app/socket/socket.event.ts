// src/app/socket/socket.event.ts
import { Socket } from 'socket.io';

import disconnectHandler from './handlers/disconnect.handler';
import { TSocket } from './interface/socket.interface';

export const registerSocketEvents = (socket: Socket) => {
  const tSocket = socket as TSocket; // Cast to TSocket

  tSocket.on('disconnect', () => disconnectHandler.call(tSocket, undefined));
};

export default registerSocketEvents;