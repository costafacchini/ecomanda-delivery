const transformChatbotBody = require('../services/ChatbotMessage')

module.exports = {
  key: 'chatbot-message',
  async handle(data) {
    return await transformChatbotBody(data.body)
  },
}
