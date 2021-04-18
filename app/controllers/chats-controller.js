const { queue } = require('@config/queue-server')

class ChatsController {
  async create(req, res) {
    await queue.addJobRequest('chat-message', req.body, req.licensee)

    res.status(201).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }
}

module.exports = ChatsController
