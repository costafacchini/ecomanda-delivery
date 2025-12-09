import { sendMessageToChat } from '../services/SendMessageToChat.js'

export default {
  key: 'send-message-to-chat',
  workerEnabled: true,
  async handle(data) {
    return await sendMessageToChat(data.body)
  },
}
