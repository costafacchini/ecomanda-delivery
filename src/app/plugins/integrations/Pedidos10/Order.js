import { requireDependency } from '../../../helpers/RequireDependency.js'

class Order {
  constructor(
    licensee,
    { orderRepository, licenseeRepository, parser, authService, webhookService, orderStatusService } = {},
  ) {
    this.licensee = licensee
    this.orderBodyParser = requireDependency(parser, 'parser', this.constructor.name)
    this.orderRepository = requireDependency(orderRepository, 'orderRepository', this.constructor.name)
    this.licenseeRepository = requireDependency(licenseeRepository, 'licenseeRepository', this.constructor.name)
    this.webhookService = requireDependency(webhookService, 'webhookService', this.constructor.name)
    this.orderStatusService = requireDependency(orderStatusService, 'orderStatusService', this.constructor.name)
    this.authService = requireDependency(authService, 'authService', this.constructor.name)
  }

  syncLicensee(licensee) {
    this.licensee = licensee
    this.webhookService.licensee = licensee
    this.orderStatusService.licensee = licensee
    this.authService.licensee = licensee
  }

  async loadOrderFromDatabase(order) {
    return await this.orderRepository.findFirst({
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
      return await this.orderRepository.create({ ...order, licensee: this.licensee })
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

    return await this.orderRepository.save(orderPersisted)
  }

  async doAuthentication() {
    // TODO - refatorar para gerar exceção ao invés de ficar retornando true ou false
    const isLogged = await this.authService.login()

    // TODO - Precisa testar esse recarregamento do Licenciado
    if (isLogged) {
      const licenseeReloaded = await this.licenseeRepository.findFirst({ _id: this.licensee.id ?? this.licensee._id })

      if (licenseeReloaded) {
        this.syncLicensee(licenseeReloaded)
      }
    }

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
    if (isAutenticated) await this.orderStatusService.change(orderId, status)
  }
}

export { Order }
