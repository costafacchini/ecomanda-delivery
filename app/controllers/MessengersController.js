const queueServer = require('@config/queue')

class MessengersController {
  async message(req, res) {
    console.info(`Mensagem chegando do plugin de whatsapp: ${JSON.stringify(req.body)}`)
    await queueServer.addJob('messenger-message', req.body, req.licensee)

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

module.exports = MessengersController
