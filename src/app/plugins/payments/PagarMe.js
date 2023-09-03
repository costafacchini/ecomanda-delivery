const Recipient = require('./PagarMe/Recipient')

class PagarMe {
  constructor(licensee) {
    this.licensee = licensee
    this.recipient = new Recipient()
  }
}

module.exports = PagarMe
