const transferToChat = require('../services/TransferToChat')

module.exports = {
  key: 'transfer-to-chat',
  async handle(data) {
    await transferToChat(data.body, data.licensee)
  },
}
