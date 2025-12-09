import { sendContactToPagarMe } from '../services/SendContactToPagarMe.js'

export default {
  key: 'send-contact-to-pagarme',
  workerEnabled: true,
  async handle(data) {
    return await sendContactToPagarMe(data.body)
  },
}
