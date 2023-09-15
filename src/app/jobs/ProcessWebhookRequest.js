const processWebhookRequest = require('../services/ProcessWebhookRequest')

module.exports = {
  key: 'process-webhook-request',
  async handle(data) {
    return await processWebhookRequest(data.body)
  },
}
