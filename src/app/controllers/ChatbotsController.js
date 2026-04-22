import { BodyRepositoryDatabase } from '../repositories/body.js'

class ChatbotsController {
  constructor({ bodyRepository = new BodyRepositoryDatabase(), queueServer, publishMessage } = {}) {
    this.bodyRepository = bodyRepository
    this.queueServer = queueServer
    this.publishMessage = publishMessage

    this.message = this.message.bind(this)
    this.transfer = this.transfer.bind(this)
    this.reset = this.reset.bind(this)
  }

  async message(req, res) {
    console.info(`Mensagem chegando do plugin de chatbot: ${JSON.stringify(req.body)}`)
    const body = await this.bodyRepository.create({ content: req.body, licensee: req.licensee._id, kind: 'normal' })

    await this.queueServer.addJob('chatbot-message', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async transfer(req, res) {
    console.info(`Transferencia solicitada: ${JSON.stringify(req.body)}`)
    const body = await this.bodyRepository.create({ content: req.body, licensee: req.licensee._id, kind: 'normal' })

    await this.queueServer.addJob('chatbot-transfer-to-chat', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }

  reset(_, res) {
    console.info('Agendando para resetar chatbots abandonados')

    this.publishMessage({ key: 'reset-chatbots', body: {} })

    res.status(200).send({ body: 'Solicitação para resetar os chatbots abandonados agendado' })
  }
}

export { ChatbotsController }
