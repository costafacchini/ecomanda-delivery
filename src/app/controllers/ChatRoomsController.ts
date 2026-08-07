import { Request, Response } from 'express'
import { IRepository } from '@repositories/repository'
import { IUser, IRoom } from '../../types'
import { IngestChatMessage } from '../usecases/webhooks/IngestChatMessage'

class ChatRoomsController {
  userRepository: IRepository<IUser>
  roomRepository: IRepository<IRoom>
  ingestChatMessage: IngestChatMessage

  constructor({
    userRepository,
    roomRepository,
    ingestChatMessage,
  }: {
    userRepository?: IRepository<IUser>
    roomRepository?: IRepository<IRoom>
    ingestChatMessage?: IngestChatMessage
  } = {}) {
    this.userRepository = userRepository!
    this.roomRepository = roomRepository!
    this.ingestChatMessage = ingestChatMessage!

    this.replyToRoom = this.replyToRoom.bind(this)
  }

  async replyToRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params
      const { text } = req.body
      const agentId = req.userId

      const [user, room] = await Promise.all([
        this.userRepository.findFirst({ _id: agentId }),
        this.roomRepository.findFirst({ _id: roomId }, ['contact']),
      ])

      if (!room || room.closed) {
        return res.status(404).json({ message: 'Conversa não encontrada ou encerrada.' })
      }

      const body = { roomId, text, agentId, agentName: user?.name ?? null }
      await this.ingestChatMessage.execute({ body, licenseeId: (room.contact as any).licensee })

      return res.status(200).json({ message: 'Mensagem enviada.' })
    } catch {
      res.status(500).json({ message: 'Erro interno do servidor.' })
    }
  }
}

export { ChatRoomsController }
