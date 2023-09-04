const Recipient = require('./PagarMe/Recipient')
const Customer = require('./PagarMe/Customer')

class PagarMe {
  constructor(licensee) {
    this.licensee = licensee
    this.recipient = new Recipient()
    this.customer = new Customer()
  }
}

module.exports = PagarMe
