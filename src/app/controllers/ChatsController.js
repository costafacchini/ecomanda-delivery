const Body = require('@models/Body')
const queueServer = require('@config/queue')

class ChatsController {
  async message(req, res) {
    const { body } = req
    // Remove crmData because of Rocketchat send a higher history inside the body
    delete body['crmData']

    console.info(`Mensagem chegando do plugin de chat: ${JSON.stringify(body)}`)
    const bodySaved = await Body.create({ content: body, licensee: req.licensee._id })

    await queueServer.addJob('chat-message', { bodyId: bodySaved._id })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  }
}

module.exports = ChatsController
