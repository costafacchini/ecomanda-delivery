import { Request, Response } from 'express'
import { logger } from '../helpers/logger'
import { IngestChatMessage } from '../usecases/webhooks/IngestChatMessage'
import { IQueueServer } from '@config/queue'

class ChatsController {
  ingestChatMessage: IngestChatMessage
  queueServer: IQueueServer

  constructor({
    ingestChatMessage,
    queueServer,
  }: { ingestChatMessage?: IngestChatMessage; queueServer?: IQueueServer } = {}) {
    this.ingestChatMessage = ingestChatMessage!
    this.queueServer = queueServer!

    this.message = this.message.bind(this)
    this.reset = this.reset.bind(this)
  }

  async message(req: Request, res: Response) {
    await this.ingestChatMessage.execute({
      body: req.body,
      licenseeId: req.licensee!._id as string,
      inboxId: (req.inbox?._id as string) ?? null,
    })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }

  async reset(_req: Request, res: Response) {
    logger.info('Agendando para resetar chats expirando')

    await this.queueServer.addJob('reset-chats', {})

    res.status(200).send({ body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso' })
  }
}

export { ChatsController }
