const transformChatBody = require('../services/chat-message')

module.exports = {
  key: 'chat-message',
  async handle(data) {
    await transformChatBody(data.body, data.licensee)
  },
}
