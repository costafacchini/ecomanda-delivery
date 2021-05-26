const transformTransferBody = require('../services/ChatbotTransfer')

module.exports = {
  key: 'chatbot-transfer-to-chat',
  async handle(data) {
    return await transformTransferBody(data.body, data.licensee)
  },
}
