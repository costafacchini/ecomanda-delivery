const processWebhook = require('../services/Pedidos10Webhook')

module.exports = {
  key: 'pedidos10-webhook',
  async handle(data) {
    return await processWebhook(data.body)
  },
}
