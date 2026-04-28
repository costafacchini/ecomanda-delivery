import { transformChatbotBody } from '../services/ChatbotMessage.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'chatbot-message',
  workerEnabled: true,
  async handle(data) {
    return await transformChatbotBody(data.body, jobDependencies)
  },
}
