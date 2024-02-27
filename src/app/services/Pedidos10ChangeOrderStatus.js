const Body = require('@models/Body')
const Pedidos10 = require('../plugins/integrations/Pedidos10')
const createIntegrator = require('../plugins/integrations/factory')

async function changeOrderStatus(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const { order, status } = body.content

  const integrator = createIntegrator(body.licensee.pedidos10_integrator)
  const pedidos10Status = integrator.parseStatus(status)

  const pedidos10 = new Pedidos10(body.licensee)
  await pedidos10.changeOrderStatus(order, pedidos10Status)
}

module.exports = changeOrderStatus
