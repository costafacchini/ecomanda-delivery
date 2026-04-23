import { Order } from './Pedidos10/Order.js'

class Pedidos10 {
  constructor(licensee, { orderModule = new Order(licensee) } = {}) {
    this.licensee = licensee
    this.orderModule = orderModule
  }

  async processOrder(body) {
    return await this.orderModule.save(body)
  }

  async signOrderWebhook() {
    await this.orderModule.signOrderWebhook()
  }

  async changeOrderStatus(orderId, status) {
    await this.orderModule.changeOrderStatus(orderId, status)
  }
}

export { Pedidos10 }
