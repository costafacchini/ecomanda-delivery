import { logger } from '../helpers/logger'

class ChatsController {
  ingestChatMessage: any
  publishMessage: any

  constructor({ ingestChatMessage, publishMessage }: Record<string, any> = {}) {
    this.ingestChatMessage = ingestChatMessage
    this.publishMessage = publishMessage

    this.message = this.message.bind(this)
    this.reset = this.reset.bind(this)
  }

  async message(req: any, res: any) {
    await this.ingestChatMessage.execute({ body: req.body, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }

  reset(_: any, res: any) {
    logger.info('Agendando para resetar chats expirando')

    this.publishMessage({ key: 'reset-chats', body: {} })

    res.status(200).send({ body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso' })
  }
}

export { ChatsController }
