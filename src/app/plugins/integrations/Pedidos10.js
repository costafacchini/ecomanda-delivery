import { requireDependency } from '../../helpers/RequireDependency'

class Pedidos10 {
  constructor(licensee, { orderModule } = {}) {
    this.licensee = licensee
    this.orderModule = requireDependency(orderModule, 'orderModule', this.constructor.name)
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
