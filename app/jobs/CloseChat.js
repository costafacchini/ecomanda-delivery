const closeChat = require('../services/CloseChat')

module.exports = {
  key: 'close-chat',
  async handle(data) {
    await closeChat(data.body, data.licensee)
  },
}
