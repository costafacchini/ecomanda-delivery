import transformChatBody from '../services/ChatMessage'

export default {
  key: 'chat-message',
  async handle(data) {
    return await transformChatBody(data.body)
  },
}
