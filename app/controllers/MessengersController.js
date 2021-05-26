const queueServer = require('@config/queue')

class MessengersController {
  async message(req, res) {
    await queueServer.addJob('messenger-message', req.body, req.licensee)

    res.status(201).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

module.exports = MessengersController
