import { logger } from '../helpers/logger'

class ChatbotsController {
  bodyRepository: any
  queueServer: any
  publishMessage: any

  constructor({ bodyRepository, queueServer, publishMessage }: Record<string, any> = {}) {
    this.bodyRepository = bodyRepository
    this.queueServer = queueServer
    this.publishMessage = publishMessage

    this.message = this.message.bind(this)
    this.transfer = this.transfer.bind(this)
    this.reset = this.reset.bind(this)
  }

  async message(req, res) {
    logger.info('Mensagem chegando do plugin de chatbot', req.body)
    const body = await this.bodyRepository.create({ content: req.body, licensee: req.licensee._id, kind: 'normal' })

    await this.queueServer.addJob('chatbot-message', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async transfer(req, res) {
    logger.info('Transferencia solicitada', req.body)
    const body = await this.bodyRepository.create({ content: req.body, licensee: req.licensee._id, kind: 'normal' })

    await this.queueServer.addJob('chatbot-transfer-to-chat', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }

  reset(_, res) {
    logger.info('Agendando para resetar chatbots abandonados')

    this.publishMessage({ key: 'reset-chatbots', body: {} })

    res.status(200).send({ body: 'Solicitação para resetar os chatbots abandonados agendado' })
  }
}

export { ChatbotsController }
