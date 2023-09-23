const Recipient = require('./PagarMe/Recipient')
const Customer = require('./PagarMe/Customer')
const Payment = require('./PagarMe/Payment')
const Parser = require('./PagarMe/Parser')
const Card = require('./PagarMe/Card')

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

module.exports = PagarMe
