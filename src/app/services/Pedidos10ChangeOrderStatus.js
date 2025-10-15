import Body from '../models/Body.js'
import { Pedidos10 } from '../plugins/integrations/Pedidos10.js'
import { createIntegrator } from '../plugins/integrations/factory.js'

async function changeOrderStatus(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const { order, status } = body.content

  const integrator = createIntegrator(body.licensee.pedidos10_integrator)
  const pedidos10Status = integrator.parseStatus(status)

  const pedidos10 = new Pedidos10(body.licensee)
  await pedidos10.changeOrderStatus(order, pedidos10Status)
}

export { changeOrderStatus }
