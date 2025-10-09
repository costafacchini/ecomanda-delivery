import Recipient from './PagarMe/Recipient.js'
import Customer from './PagarMe/Customer.js'
import Payment from './PagarMe/Payment.js'
import Parser from './PagarMe/Parser.js'
import Card from './PagarMe/Card.js'

class PagarMe {
  constructor(licensee) {
    this.licensee = licensee
    this.recipient = new Recipient()
    this.customer = new Customer()
    this.payment = new Payment()
    this.parser = new Parser()
    this.card = new Card()
  }
}

export default PagarMe
