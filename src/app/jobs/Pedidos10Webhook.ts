import { processWebhook } from '../services/Pedidos10Webhook'
import { jobDependencies } from './dependencies'

export default {
  key: 'pedidos10-webhook',
  workerEnabled: true,
  async handle(data) {
    return await processWebhook(data.body, jobDependencies)
  },
}
