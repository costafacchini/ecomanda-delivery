import { transformChatbotBody } from '../services/ChatbotMessage'
import { jobDependencies } from './dependencies'

export default {
  key: 'chatbot-message',
  workerEnabled: true,
  async handle(data) {
    return await transformChatbotBody(data.body, jobDependencies)
  },
}
