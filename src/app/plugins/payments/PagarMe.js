const Recipient = require('./PagarMe/Recipient')
const Customer = require('./PagarMe/Customer')
const Payment = require('./PagarMe/Payment')

class PagarMe {
  constructor(licensee) {
    this.licensee = licensee
    this.recipient = new Recipient()
    this.customer = new Customer()
    this.payment = new Payment()
  }
}

module.exports = PagarMe
