import { sendMessageToChatbot } from '../services/SendMessageToChatbot.js'

export default {
  key: 'send-message-to-chatbot',
  async handle(data) {
    return await sendMessageToChatbot(data.body)
  },
}
