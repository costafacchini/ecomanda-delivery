const resetChats = require('../services/ResetChats')

module.exports = {
  key: 'reset-chats',
  async handle(data) {
    return await resetChats(data.body)
  },
}
