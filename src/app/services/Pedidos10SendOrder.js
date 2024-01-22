const Order = require('@models/Order')
const Pedidos10 = require('../plugins/integrations/Pedidos10')

async function sendOrder(data) {
  const { orderId } = data
  const order = await Order.findById(orderId).populate('licensee')

  const pedidos10 = new Pedidos10(order.licensee)
  const orderChanged = await pedidos10.sendOrder(order)

  await orderChanged.save()
}

module.exports = sendOrder
