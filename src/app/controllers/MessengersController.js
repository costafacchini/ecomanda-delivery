import { BodyRepositoryDatabase } from '../repositories/body.js'

class MessengersController {
  constructor({ bodyRepository = new BodyRepositoryDatabase(), queueServer } = {}) {
    this.bodyRepository = bodyRepository
    this.queueServer = queueServer

    this.message = this.message.bind(this)
  }

  async message(req, res) {
    console.info(`Mensagem chegando do plugin de whatsapp: ${JSON.stringify(req.body)}`)
    const body = await this.bodyRepository.create({ content: req.body, licensee: req.licensee._id, kind: 'normal' })

    await this.queueServer.addJob('messenger-message', { bodyId: body._id, licenseeId: req.licensee._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

export { MessengersController }
