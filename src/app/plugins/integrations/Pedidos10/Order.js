const Parser = require('./Parser')
const { createOrder, getOrderBy } = require('@repositories/order')

class Order {
  constructor(licensee) {
    this.licensee = licensee
    this.orderBodyParser = new Parser()
    this.order_persisted
    this.order
  }

  async loadOrderFromDatabase(order) {
    return await getOrderBy({
      licensee: this.licensee,
      merchant_external_code: order.merchant_external_code,
      order_external_id: order.order_external_id,
    })
  }

  alreadyExists(orderPersisted) {
    return !!orderPersisted
  }

  async save(body) {
    const order = this.orderBodyParser.parseOrder(body)
    const orderPersisted = await this.loadOrderFromDatabase(order)

    if (!this.alreadyExists(orderPersisted)) {
      return await createOrder({ ...order, licensee: this.licensee })
    }

    if (orderPersisted.status != order.status) {
      orderPersisted.integration_status = 'pending'
    }

    orderPersisted.status = order.status
    orderPersisted.items = order.items
    orderPersisted.payments = order.payments
    orderPersisted.total_items = order.total_items
    orderPersisted.total_fees = order.total_fees
    orderPersisted.total_discount = order.total_discount
    orderPersisted.total_addition = order.total_addition
    orderPersisted.total = order.total

    return await orderPersisted.save()
  }
}

module.exports = Order
