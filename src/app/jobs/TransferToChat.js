const transferToChat = require('../services/TransferToChat')

module.exports = {
  key: 'transfer-to-chat',
  async handle(data) {
    return await transferToChat(data.body)
  },
}
