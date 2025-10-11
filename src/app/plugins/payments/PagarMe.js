import Recipient from './PagarMe/Recipient'
import Customer from './PagarMe/Customer'
import Payment from './PagarMe/Payment'
import Parser from './PagarMe/Parser'
import Card from './PagarMe/Card'

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
