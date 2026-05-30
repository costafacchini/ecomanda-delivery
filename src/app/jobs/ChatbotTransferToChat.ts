import { transformChatbotTransferBody } from '../services/ChatbotTransfer'
import { jobDependencies } from './dependencies'

export default {
  key: 'chatbot-transfer-to-chat',
  workerEnabled: true,
  async handle(data) {
    return await transformChatbotTransferBody(data.body, jobDependencies)
  },
}
