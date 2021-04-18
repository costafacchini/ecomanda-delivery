const { queue } = require('@config/queue-server')

class ChatbotsController {
  async create(req, res) {
    await queue.addJobRequest('chatbot-message', req.body, req.licensee)

    res.status(201).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async change(req, res) {
    await queue.addJobRequest('chatbot-transfer-to-chat', req.body, req.licensee)

    res.status(201).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }
}

module.exports = ChatbotsController
