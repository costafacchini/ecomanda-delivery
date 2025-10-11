import sendMessageToMessenger from '../services/SendMessageToMessenger'

export default {
  key: 'send-message-to-messenger',
  async handle(data) {
    return await sendMessageToMessenger(data.body)
  },
}
