import { sendMessageToChatbot } from '../services/SendMessageToChatbot'
import { jobDependencies } from './dependencies'

export default {
  key: 'send-message-to-chatbot',
  workerEnabled: true,
  async handle(data) {
    return await sendMessageToChatbot(data.body, jobDependencies)
  },
}
