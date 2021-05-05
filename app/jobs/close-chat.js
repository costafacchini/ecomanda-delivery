const closeChat = require('../services/close-chat')

module.exports = {
  key: 'close-chat',
  async handle(data) {
    await closeChat(data.body, data.licensee)
  },
}
