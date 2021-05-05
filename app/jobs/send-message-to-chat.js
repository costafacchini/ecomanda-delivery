const sendMessageToChat = require('../services/send-message-to-chat')

module.exports = {
  key: 'send-message-to-chat',
  async handle(data) {
    await sendMessageToChat(data.body, data.licensee)
  },
}
