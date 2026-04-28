import { transformChatbotTransferBody } from '../services/ChatbotTransfer.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'chatbot-transfer-to-chat',
  workerEnabled: true,
  async handle(data) {
    return await transformChatbotTransferBody(data.body, jobDependencies)
  },
}
