import { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';

import { IUserRole } from '@/app/modules/user/user.constant';
import { IUser } from '@/app/modules/user/user.interface';

export interface ITokenPayload extends JwtPayload {
  sub: string;
  rememberMe?: boolean;
  role: IUserRole;
  isVerified: boolean;
  accountStatus: string;
}

export interface AuthenticatedSocket extends Socket {
  user?: IUser;
  traceId?: string;
}
