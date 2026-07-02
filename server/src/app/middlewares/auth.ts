import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

import { env } from '@/app/configs/env.configs';
import { getTraceId } from '@/app/configs/requestContext.configs';
import ApiError from '@/app/errors/ApiError';
import { IUserRole } from '@/app/modules/user/user.constant';
import { User } from '@/app/modules/user/user.model';
import { asyncHandler } from '@/app/utils/system.utils';

const auth = (...requiredRoles: IUserRole[]) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const traceId = getTraceId();
    const token = req.headers.authorization;

    if (!token) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Unauthorized Access', traceId);
    }

    let decoded: JwtPayload;
    try {
      decoded = verify(token, env.JWT_ACCESS_TOKEN_SECRET_KEY as string) as JwtPayload;
    } catch (_err) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'Unauthorized Access!', traceId);
    }

    const { role, email } = decoded;

    const user = await User.isUserExistsByEmail(email);
    if (!user || user?.isDeleted) {
      throw new ApiError(HttpStatusCode.NotFound, 'This user is not found !', traceId);
    }

    if (user?.status === 'blocked') {
      throw new ApiError(HttpStatusCode.Forbidden, 'This user is blocked !!', traceId);
    }

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new ApiError(HttpStatusCode.Unauthorized, 'You are not authorized!', traceId);
    }

    req.user = decoded as any;
    next();
  });
};

export default auth;
