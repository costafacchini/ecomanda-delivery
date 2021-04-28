const { queue } = require('@config/queue-server')

class ChatsController {
  async message(req, res) {
    await queue.addJobResolver('chat-message', req.body, req.licensee)

    res.status(201).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }
}

module.exports = ChatsController
