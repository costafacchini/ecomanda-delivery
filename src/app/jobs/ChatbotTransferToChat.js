const transformChatbotTransferBody = require('../services/ChatbotTransfer')

module.exports = {
  key: 'chatbot-transfer-to-chat',
  async handle(data) {
    return await transformChatbotTransferBody(data.body)
  },
}
