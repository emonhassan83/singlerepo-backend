import { Socket } from 'socket.io';

import { IUserRole } from '@/app/modules/user/user.constant';

export type TSocketUser = { _id: string; email: string; role?: IUserRole };

export type TAckRes = { success: boolean; message?: string; data?: any; status?: number };
export type TAckFn = (response: TAckRes) => void;

export type TSocketHandler<TData = any> = (
  socket: TSocket,
  data?: TData, // ✅ optional
  ack?: TAckFn
) => Promise<void>;

export type TError = {
  message: string;
  statusCode?: number;
};

export type TSocket = Socket & {
  auth: TSocketUser;
  data?: { user?: any };
};
