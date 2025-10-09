import Integrationlog from '@models/Integrationlog.js'
import Body from '@models/Body.js'
import queueServer from '@config/queue.js'

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

  async changeStatus(req, res) {
    const { order, status } = req.body
    const body = { order, status }

    const integrationlog = await Integrationlog.create({
      licensee: req.licensee._id,
      log_payload: body,
    })

    const bodySaved = await Body.create({ content: body, licensee: req.licensee._id, kind: 'pedidos10' })

    console.info(`Requisição para mudar o status do pedido recebida: ${integrationlog._id}`)

    await queueServer.addJob('pedidos10-change-order-status', { bodyId: bodySaved._id })

    res.status(200).send({ id: bodySaved._id })
  }
}

export default OrdersController
