import processWebhookRequest from '../services/ProcessWebhookRequest'

export default {
  key: 'process-webhook-request',
  async handle(data) {
    return await processWebhookRequest(data.body)
  },
}
