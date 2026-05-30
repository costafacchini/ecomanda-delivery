import { requireDependency } from '../../helpers/RequireDependency'

class Pedidos10 {
  licensee: any
  orderModule: any

  constructor(licensee, { orderModule }: Record<string, any> = {}) {
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
