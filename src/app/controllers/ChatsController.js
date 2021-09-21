const Body = require('@models/Body')
const queueServer = require('@config/queue')

class ChatsController {
  async message(req, res) {
    console.info(`Mensagem chegando do plugin de chat para ${req.licensee.name}: ${JSON.stringify(req.body)}`)

    try {
      const body = await Body.create({ content: req.body, licensee: req.licensee._id })

      await queueServer.addJob('chat-message', { bodyId: body._id })

      res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
    } catch (err) {
      console.info(`Erro ao gravar o body: ${err.toString()}`)
      res.status(500).send({ body: err.toString() })
    }
  }
}

module.exports = ChatsController
