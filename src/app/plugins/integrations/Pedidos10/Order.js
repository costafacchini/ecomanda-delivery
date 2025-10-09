import Licensee from '@models/Licensee.js'
import Parser from './Parser.js'
import Webhook from './services/Webhook.js'
import OrderStatus from './services/OrderStatus.js'
import Auth from './services/Auth.js'
import { OrderRepositoryDatabase  } from '@repositories/order.js'

class Order {
  constructor(licensee) {
    this.licensee = licensee
    this.orderBodyParser = new Parser()
    this.webhookService = new Webhook(licensee)
    this.orderSatatusService = new OrderStatus(licensee)
    this.authService = new Auth(licensee)
  }

  async loadOrderFromDatabase(order) {
    const orderRepository = new OrderRepositoryDatabase()
    return await orderRepository.findFirst({
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
      const orderRepository = new OrderRepositoryDatabase()
      return await orderRepository.create({ ...order, licensee: this.licensee })
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
    // TODO - refatorar para gerar exceção ao invés de ficar retornando true ou false
    const isLogged = await this.authService.login()

    // TODO - Precisa testar esse recarregamento do Licenciado
    if (isLogged) this.licensee = await Licensee.findOne({ _id: this.licensee.id })

    return isLogged
  }

  async checkAuth() {
    if (!this.licensee.pedidos10_integration?.authenticated) {
      return await this.doAuthentication()
    }

    return true
  }

  async signOrderWebhook() {
    const isAutenticated = await this.checkAuth()
    if (isAutenticated) await this.webhookService.sign()
  }

  async changeOrderStatus(orderId, status) {
    const isAutenticated = await this.checkAuth()
    if (isAutenticated) await this.orderSatatusService.change(orderId, status)
  }
}

export default Order
