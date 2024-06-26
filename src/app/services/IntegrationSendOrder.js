const createIntegrator = require('../plugins/integrations/factory')
const { OrderRepositoryDatabase } = require('@repositories/order')

async function sendOrder(data) {
  const { orderId } = data

  const orderRepository = new OrderRepositoryDatabase()
  const order = await orderRepository.findFirst({ _id: orderId }, ['licensee'])

  const integrator = createIntegrator(order.licensee.pedidos10_integrator)
  try {
    await integrator.sendOrder(order)
    order.integration_status = 'done'
  } catch (err) {
    order.integration_status = 'error'
    order.integration_error = err.toString()
  }

  await order.save()
}

module.exports = sendOrder
