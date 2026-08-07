import { Request, Response } from 'express'
import { logger } from '../helpers/logger'
import { IRepository } from '@repositories/repository'
import { IBody } from '../../types'

interface QueueServer {
  addJob(name: string, data: Record<string, unknown>): Promise<unknown>
}

class ChatbotsController {
  bodyRepository: IRepository<IBody>
  queueServer: QueueServer

  constructor({
    bodyRepository,
    queueServer,
  }: { bodyRepository?: IRepository<IBody>; queueServer?: QueueServer } = {}) {
    this.bodyRepository = bodyRepository!
    this.queueServer = queueServer!

    this.message = this.message.bind(this)
    this.transfer = this.transfer.bind(this)
    this.reset = this.reset.bind(this)
  }

  async message(req: Request, res: Response) {
    logger.info('Mensagem chegando do plugin de chatbot', req.body)
    const body = await this.bodyRepository.create({ content: req.body, licensee: req.licensee!._id, kind: 'normal' })

    await this.queueServer.addJob('chatbot-message', { bodyId: body._id, licenseeId: req.licensee!._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async transfer(req: Request, res: Response) {
    logger.info('Transferencia solicitada', req.body)
    const body = await this.bodyRepository.create({ content: req.body, licensee: req.licensee!._id, kind: 'normal' })

    await this.queueServer.addJob('chatbot-transfer-to-chat', { bodyId: body._id, licenseeId: req.licensee!._id })

    res.status(200).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }

  async reset(_req: Request, res: Response) {
    logger.info('Agendando para resetar chatbots abandonados')

    await this.queueServer.addJob('reset-chatbots', {})

    res.status(200).send({ body: 'Solicitação para resetar os chatbots abandonados agendado' })
  }
}

export { ChatbotsController }
