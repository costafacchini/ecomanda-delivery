import { transformChatbotTransferBody } from '../services/ChatbotTransfer.js'

export default {
  key: 'chatbot-transfer-to-chat',
  async handle(data) {
    return await transformChatbotTransferBody(data.body)
  },
}
