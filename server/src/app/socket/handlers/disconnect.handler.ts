import { TSocket } from '@/app/socket/interface/socket.interface';
import { getIO } from '@/app/socket/socket.init';
import eventHandler from '@/app/socket/utils/eventHandler';
import onlineUsers from '@/app/socket/utils/onlineUsers';

const disconnectHandler = eventHandler<any>(
  async (socket: TSocket, _data?: any, _ack?: any) => {
    try {
      const userId = socket.auth?._id?.toString()

      if (userId) {
        delete onlineUsers[userId]

        const io = getIO()
        io.emit('onlineUser', Object.keys(onlineUsers).length)

        console.log(`👤 User disconnected: ${userId}`)
      }
    } catch (err: any) {
      console.error('❌ Disconnect handler error:', err.message)
    }
  }
)

export default disconnectHandler;