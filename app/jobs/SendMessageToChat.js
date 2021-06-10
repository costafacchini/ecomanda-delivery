const sendMessageToChat = require('../services/SendMessageToChat')

module.exports = {
  key: 'send-message-to-chat',
  async handle(data) {
    return await sendMessageToChat(data.body)
  },
}
