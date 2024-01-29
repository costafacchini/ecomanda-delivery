const Parser = require('./Parser')
const { createOrder, getOrderBy } = require('@repositories/order')

class Order {
  constructor(licensee) {
    this.licensee = licensee

    this.parser = new Parser()

    this.order_persisted
  }

  parseBody(body) {
    this.order = this.parser.parseOrder(body)
  }

  async loadOrderFromDatabase() {
    this.order_persisted = await getOrderBy({
      licensee: this.licensee,
      merchant_external_code: this.order.merchant_external_code,
      order_external_id: this.order.order_external_id,
    })
  }

  alreadyExists() {
    return !!this.order_persisted
  }

  async save() {
    if (!this.alreadyExists()) {
      return await createOrder({ ...this.order, licensee: this.licensee })
    }

    if (this.order_persisted.status != this.order.status) {
      this.order_persisted.integration_status = 'pending'
    }

    this.order_persisted.status = this.order.status
    this.order_persisted.items = this.order.items
    this.order_persisted.payments = this.order.payments
    this.order_persisted.total_items = this.order.total_items
    this.order_persisted.total_fees = this.order.total_fees
    this.order_persisted.total_discount = this.order.total_discount
    this.order_persisted.total_addition = this.order.total_addition
    this.order_persisted.total = this.order.total

    return await this.order_persisted.save()
  }
}

module.exports = Order
