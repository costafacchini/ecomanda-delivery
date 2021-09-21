const Body = require('@models/Body')
const queueServer = require('@config/queue')

class ChatsController {
  async message(req, res) {
    console.info(`Mensagem chegando do plugin de chat: ${JSON.stringify(req.body)}`)
    const body = new Body({ content: req.body, licensee: req.licensee._id })
    await body.save()

    await queueServer.addJob('chat-message', { bodyId: body._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }
}

module.exports = ChatsController
