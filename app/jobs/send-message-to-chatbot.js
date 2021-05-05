const sendMessageToChatbot = require('../services/send-message-to-chatbot')

module.exports = {
  key: 'send-message-to-chatbot',
  async handle(data) {
    await sendMessageToChatbot(data.body, data.licensee)
  },
}
