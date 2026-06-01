import { sendContactToPagarMe } from '../services/SendContactToPagarMe'
import { jobDependencies } from './dependencies'

export default {
  key: 'send-contact-to-pagarme',
  workerEnabled: true,
  async handle(data: any) {
    return await sendContactToPagarMe(data.body, jobDependencies)
  },
}
