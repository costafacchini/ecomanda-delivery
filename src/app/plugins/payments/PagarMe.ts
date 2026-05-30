import { requireDependency } from '../../helpers/RequireDependency'

class PagarMe {
  licensee: any
  recipient: any
  customer: any
  payment: any
  parser: any
  card: any

  constructor(licensee: any, { recipient, customer, payment, parser, card }: Record<string, any> = {}) {
    this.licensee = licensee
    this.recipient = requireDependency(recipient, 'recipient', this.constructor.name)
    this.customer = requireDependency(customer, 'customer', this.constructor.name)
    this.payment = requireDependency(payment, 'payment', this.constructor.name)
    this.parser = requireDependency(parser, 'parser', this.constructor.name)
    this.card = requireDependency(card, 'card', this.constructor.name)
  }
}

export { PagarMe }
