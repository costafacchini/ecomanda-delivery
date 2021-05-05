const sendMessageToMessenger = require('../services/SendMessageToMessenger')

module.exports = {
  key: 'send-message-to-messenger',
  async handle(data) {
    await sendMessageToMessenger(data.body, data.licensee)
  },
}
