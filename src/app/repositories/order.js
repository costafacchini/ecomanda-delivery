const Order = require('@models/Order')

async function createOrder(fields) {
  const order = new Order({
    ...fields,
  })

  return await order.save()
}

async function getOrderBy(filter) {
  return await Order.findOne(filter)
}

module.exports = { createOrder, getOrderBy }
