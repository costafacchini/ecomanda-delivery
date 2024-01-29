const Licensee = require('@models/Licensee')
const Parser = require('./Parser')
const Webhook = require('./services/Webhook')
const OrderStatus = require('./services/OrderStatus')
const Auth = require('./services/Auth')
const { createOrder, getOrderBy } = require('@repositories/order')

class Order {
  constructor(licensee) {
    this.licensee = licensee
    this.orderBodyParser = new Parser()
    this.webhookService = new Webhook(licensee)
    this.orderSatatusService = new OrderStatus(licensee)
    this.authService = new Auth(licensee)
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

  async doAuthentication() {
    await this.authService.login()

    // TODO - Precisa testar esse recarregamento do Licenciado
    this.licensee = await Licensee.findOne({ _id: this.licensee.id })
  }

  async checkAuth() {
    if (!this.licensee.pedidos10_integration?.access_token) {
      await this.doAuthentication()
    }
  }

  async signOrderWebhook() {
    await this.checkAuth()
    await this.webhookService.sign()
  }

  async changeOrderStatus(orderId, status) {
    await this.checkAuth()
    await this.orderSatatusService.change(orderId, status)
  }
}

module.exports = Order
