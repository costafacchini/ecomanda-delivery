const sendMessageToChatbot = require('../services/SendMessageToChatbot')

module.exports = {
  key: 'send-message-to-chatbot',
  async handle(data) {
    return await sendMessageToChatbot(data.body)
  },
}
