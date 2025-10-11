import sendContactToPagarMe from '../services/SendContactToPagarMe'

export default {
  key: 'send-contact-to-pagarme',
  async handle(data) {
    return await sendContactToPagarMe(data.body)
  },
}
