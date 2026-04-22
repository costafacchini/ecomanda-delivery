import { BodyRepositoryDatabase } from '../repositories/body.js'

class ChatsController {
  constructor({ bodyRepository = new BodyRepositoryDatabase(), queueServer, publishMessage } = {}) {
    this.bodyRepository = bodyRepository
    this.queueServer = queueServer
    this.publishMessage = publishMessage

    this.message = this.message.bind(this)
    this.reset = this.reset.bind(this)
  }

  async message(req, res) {
    const { body } = req
    // Remove crmData because of Rocketchat send a higher history inside the body
    delete body['crmData']

    console.info(`Mensagem chegando do plugin de chat: ${JSON.stringify(body)}`)
    const bodySaved = await this.bodyRepository.create({ content: body, licensee: req.licensee._id, kind: 'normal' })

    await this.queueServer.addJob('chat-message', { bodyId: bodySaved._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }

  reset(_, res) {
    console.info('Agendando para resetar chats expirando')

    this.publishMessage({ key: 'reset-chats', body: {} })

    res.status(200).send({ body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso' })
  }
}

export { ChatsController }
