import processWebhook from '../services/Pedidos10Webhook'

export default {
  key: 'pedidos10-webhook',
  async handle(data) {
    return await processWebhook(data.body)
  },
}
