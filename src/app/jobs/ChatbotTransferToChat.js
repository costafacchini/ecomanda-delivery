import transformChatbotTransferBody from '../services/ChatbotTransfer'

export default {
  key: 'chatbot-transfer-to-chat',
  async handle(data) {
    return await transformChatbotTransferBody(data.body)
  },
}
