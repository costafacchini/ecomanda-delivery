const Order = require('@models/Order')
const createIntegrator = require('../plugins/integrations/factory')

async function sendOrder(data) {
  const { orderId } = data
  const order = await Order.findById(orderId).populate('licensee')

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
