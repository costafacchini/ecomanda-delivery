const { queue } = require('@config/queue-server')

class MessengersController {
  async create(req, res) {
    await queue.addJobRequest('messenger-message', req.body, req.licensee)

    res.status(201).send({ body: 'Solicitação de de mensagem para a plataforma de messenger agendado' })
  }
}

module.exports = MessengersController
