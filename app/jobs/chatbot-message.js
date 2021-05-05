const transformChatbotBody = require('../services/chatbot-message')

module.exports = {
  key: 'chatbot-message',
  async handle(data) {
    await transformChatbotBody(data.body, data.licensee)
  },
}
