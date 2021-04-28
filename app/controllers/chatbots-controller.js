const { queue } = require('@config/queue-server')

class ChatbotsController {
  async message(req, res) {
    await queue.addJobResolver('chatbot-message', req.body, req.licensee)

    res.status(201).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async transfer(req, res) {
    await queue.addJobResolver('chatbot-transfer-to-chat', req.body, req.licensee)

    res.status(201).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }
}

module.exports = ChatbotsController
