const transformTransferBody = require('../services/chatbot-transfer')

module.exports = {
  key: 'chatbot-transfer-to-chat',
  async handle(data) {
    await transformTransferBody(data.body, data.licensee)
  },
}
