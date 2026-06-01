import { processWebhookRequest } from '../services/ProcessWebhookRequest'
import { jobDependencies } from './dependencies'

export default {
  key: 'process-webhook-request',
  workerEnabled: true,
  async handle(data: any) {
    return await processWebhookRequest(data.body, jobDependencies)
  },
}
