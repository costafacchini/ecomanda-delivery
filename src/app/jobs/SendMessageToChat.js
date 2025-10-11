import sendMessageToChat from '../services/SendMessageToChat'

export default {
  key: 'send-message-to-chat',
  async handle(data) {
    return await sendMessageToChat(data.body)
  },
}
