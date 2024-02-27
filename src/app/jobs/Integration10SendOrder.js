const sendOrder = require('../services/IntegrationSendOrder')

module.exports = {
  key: 'integration-send-order',
  async handle(data) {
    return await sendOrder(data.body)
  },
}
