import Order from './Pedidos10/Order'

class Pedidos10 {
  constructor(licensee) {
    this.licensee = licensee
    this.orderModule = new Order(this.licensee)
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

export default Pedidos10
