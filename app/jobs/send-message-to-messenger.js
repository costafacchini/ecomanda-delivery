const sendMessageToMessenger = require('../services/send-message-to-messenger')

module.exports = {
  key: 'send-message-to-messenger',
  async handle(data) {
    await sendMessageToMessenger(data.body, data.licensee)
  },
}
