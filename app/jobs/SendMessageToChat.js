const sendMessageToChat = require('../services/SendMessageToChat')

module.exports = {
  key: 'send-message-to-chat',
  async handle(data) {
    await sendMessageToChat(data.body, data.licensee)
  },
}
