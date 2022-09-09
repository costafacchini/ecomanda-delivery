const Body = require('@models/Body')
const { publishMessage } = require('@config/rabbitmq')

class ChatbotsController {
  async message(req, res) {
    console.info(`Mensagem chegando do plugin de chatbot: ${JSON.stringify(req.body)}`)
    const body = new Body({ content: req.body, licensee: req.licensee._id })
    await body.save()

    publishMessage({ key: 'chatbot-message', body: { bodyId: body._id } })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  }

  async transfer(req, res) {
    console.info(`Transferencia solicitada: ${JSON.stringify(req.body)}`)
    const body = new Body({ content: req.body, licensee: req.licensee._id })
    await body.save()

    publishMessage({ key: 'chatbot-transfer-to-chat', body: { bodyId: body._id } })

    res.status(200).send({ body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado' })
  }

  reset(_, res) {
    console.info('Agendando para resetar chatbots abandonados')

    publishMessage({ key: 'reset-chatbots', body: {} })

    res.status(200).send({ body: 'Solicitação para resetar os chatbots abandonados agendado' })
  }
}

module.exports = ChatbotsController
