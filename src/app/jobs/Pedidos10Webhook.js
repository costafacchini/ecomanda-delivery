import { processWebhook } from '../services/Pedidos10Webhook.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'pedidos10-webhook',
  workerEnabled: true,
  async handle(data) {
    return await processWebhook(data.body, jobDependencies)
  },
}
