const Body = require('@models/Body')
const queueServer = require('@config/queue')
const logger = require('@config/logger')

class MessengersController {
  async message(req, res) {
    logger.info(`Mensagem chegando do plugin de whatsapp: ${JSON.stringify(req.body)}`)
    const body = new Body({ content: req.body, licensee: req.licensee._id })
    await body.save()

    await queueServer.addJob('messenger-message', { bodyId: body._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

module.exports = MessengersController
