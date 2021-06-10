const sendMessageToMessenger = require('../services/SendMessageToMessenger')

module.exports = {
  key: 'send-message-to-messenger',
  async handle(data) {
    return await sendMessageToMessenger(data.body)
  },
}
