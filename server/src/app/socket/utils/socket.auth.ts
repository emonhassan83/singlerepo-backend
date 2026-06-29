import { HttpStatusCode } from 'axios'
import { verify } from 'jsonwebtoken'
import { Socket } from 'socket.io'

import { env } from '@/app/configs/env.configs'
import ApiError from '@/app/errors/ApiError'
import { TSocketUser } from '@/app/socket/interface/socket.interface'

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.token
  if (!token) {
    throw new ApiError(HttpStatusCode.Unauthorized, 'you are not authorized!')
  }

  try {
    const decoded = verify(
      token,
      env.JWT_ACCESS_TOKEN_SECRET_KEY as string,
    ) as TSocketUser

    // Add auth to socket using type assertion
    ;(socket as any).auth = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
    }
    next()
  } catch (err: unknown) {
    console.error(err)
    next(new ApiError(HttpStatusCode.Unauthorized, 'you are not authorized!'))
  }
}
