import { processWebhookRequest } from '../services/ProcessWebhookRequest.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'process-webhook-request',
  workerEnabled: true,
  async handle(data) {
    return await processWebhookRequest(data.body, jobDependencies)
  },
}
