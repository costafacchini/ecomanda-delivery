class ChatRoomsController {
  userRepository: any
  roomRepository: any
  ingestChatMessage: any

  constructor({ userRepository, roomRepository, ingestChatMessage }: Record<string, any> = {}) {
    this.userRepository = userRepository
    this.roomRepository = roomRepository
    this.ingestChatMessage = ingestChatMessage

    this.replyToRoom = this.replyToRoom.bind(this)
  }

  async replyToRoom(req: any, res: any) {
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
      await this.ingestChatMessage.execute({ body, licenseeId: room.contact.licensee })

      return res.status(200).json({ message: 'Mensagem enviada.' })
    } catch {
      res.status(500).json({ message: 'Erro interno do servidor.' })
    }
  }
}

export { ChatRoomsController }
