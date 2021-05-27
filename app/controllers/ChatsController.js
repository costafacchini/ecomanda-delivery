const queueServer = require('@config/queue')

class ChatsController {
  async message(req, res) {
    await queueServer.addJob('chat-message', req.body, req.licensee)

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }
}

module.exports = ChatsController
