const transformChatBody = require('../services/ChatMessage')

module.exports = {
  key: 'chat-message',
  async handle(data) {
    return await transformChatBody(data.body)
  },
}
