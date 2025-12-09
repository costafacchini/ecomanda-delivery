import { transformChatBody } from '../services/ChatMessage.js'

export default {
  key: 'chat-message',
  workerEnabled: true,
  async handle(data) {
    return await transformChatBody(data.body)
  },
}
