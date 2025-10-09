import sendMessageToMessenger from '../services/SendMessageToMessenger.js'

export default {
  key: 'send-message-to-messenger',
  async handle(data) {
    return await sendMessageToMessenger(data.body)
  },
}
