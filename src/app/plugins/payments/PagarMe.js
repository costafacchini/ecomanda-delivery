import { Recipient } from './PagarMe/Recipient.js'
import { Customer } from './PagarMe/Customer.js'
import { Payment } from './PagarMe/Payment.js'
import { Parser } from './PagarMe/Parser.js'
import { Card } from './PagarMe/Card.js'

class PagarMe {
  constructor(
    licensee,
    {
      recipient = new Recipient(),
      customer = new Customer(),
      payment = new Payment(),
      parser = new Parser(),
      card = new Card(),
    } = {},
  ) {
    this.licensee = licensee
    this.recipient = recipient
    this.customer = customer
    this.payment = payment
    this.parser = parser
    this.card = card
  }
}

export { PagarMe }
