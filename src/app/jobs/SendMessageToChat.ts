import { sendMessageToChat } from '../services/SendMessageToChat'
import { jobDependencies } from './dependencies'

export default {
  key: 'send-message-to-chat',
  workerEnabled: true,
  async handle(data) {
    return await sendMessageToChat(data.body, jobDependencies)
  },
}
