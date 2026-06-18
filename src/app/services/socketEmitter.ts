import { Emitter } from '@socket.io/redis-emitter'
import { redisConnection } from '../../config/redis'

// Dedicated connection — subscribe mode blocks the shared BullMQ connection
const emitClient = redisConnection.duplicate()
const emitter = new Emitter(emitClient)

const emitToLicensee = (licenseeId: any, event: string, data: any) => {
  emitter.to(`licensee:${licenseeId.toString()}`).emit(event, data)
}

export { emitToLicensee }
