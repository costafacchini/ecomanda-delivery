const Integrationlog = require('@models/Integrationlog')
const Body = require('@models/Body')
const queueServer = require('@config/queue')

class OrdersController {
  async create(req, res) {
    const { MerchantExternalCode, order } = req.body
    const body = { MerchantExternalCode, order }

    const integrationlog = await Integrationlog.create({
      licensee: req.licensee._id,
      log_payload: body,
    })

    const bodySaved = await Body.create({ content: body, licensee: req.licensee._id, kind: 'pedidos10' })

    console.info(`Requisição do Pedidos 10 para processar pedidos recebida: ${integrationlog._id}`)

    await queueServer.addJob('pedidos10-webhook', { bodyId: bodySaved._id })

    res.status(202).send({ id: bodySaved._id })
  }
}

module.exports = OrdersController
