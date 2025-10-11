import transformChatbotBody from '../services/ChatbotMessage'

export default {
  key: 'chatbot-message',
  async handle(data) {
    return await transformChatbotBody(data.body)
  },
}
