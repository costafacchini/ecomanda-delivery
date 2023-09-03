const sendContactToPagarMe = require('../services/SendContactToPagarMe')

module.exports = {
  key: 'send-contact-to-pagarme',
  async handle(data) {
    return await sendContactToPagarMe(data.body)
  },
}
