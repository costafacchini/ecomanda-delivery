const transformChatbotBody = require('../services/ChatbotMessage')

module.exports = {
  key: 'chatbot-message',
  async handle(data) {
    await transformChatbotBody(data.body, data.licensee)
  },
}
