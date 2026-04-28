import { requireDependency } from '../../helpers/RequireDependency.js'

class PagarMe {
  constructor(licensee, { recipient, customer, payment, parser, card } = {}) {
    this.licensee = licensee
    this.recipient = requireDependency(recipient, 'recipient', this.constructor.name)
    this.customer = requireDependency(customer, 'customer', this.constructor.name)
    this.payment = requireDependency(payment, 'payment', this.constructor.name)
    this.parser = requireDependency(parser, 'parser', this.constructor.name)
    this.card = requireDependency(card, 'card', this.constructor.name)
  }
}

export { PagarMe }
