const queueServer = require('@config/queue')

class ChatbotsController {
  async message(req, res) {
    console.info(`Mensagem chegando do plugin de chatbot: ${JSON.stringify(req.body)}`)
    await queueServer.addJob('chatbot-message', req.body, req.licensee)

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async transfer(req, res) {
    console.info(`Transferencia solicitada: ${JSON.stringify(req.body)}`)
    await queueServer.addJob('chatbot-transfer-to-chat', req.body, req.licensee)

    res.status(200).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }
}

module.exports = ChatbotsController
