const transformChatBody = require('../services/ChatMessage')

module.exports = {
  key: 'chat-message',
  async handle(data) {
    await transformChatBody(data.body, data.licensee)
  },
}
