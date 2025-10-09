import sendMessageToChat from '../services/SendMessageToChat.js'

export default {
  key: 'send-message-to-chat',
  async handle(data) {
    return await sendMessageToChat(data.body)
  },
}
