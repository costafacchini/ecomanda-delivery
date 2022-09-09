const Body = require('@models/Body')
const { publishMessage } = require('@config/rabbitmq')

class MessengersController {
  async message(req, res) {
    console.info(`Mensagem chegando do plugin de whatsapp: ${JSON.stringify(req.body)}`)
    const body = new Body({ content: req.body, licensee: req.licensee._id })
    await body.save()

    publishMessage({ key: 'messenger-message', body: { bodyId: body._id } })

    res.status(200).send({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  }
}

module.exports = MessengersController
