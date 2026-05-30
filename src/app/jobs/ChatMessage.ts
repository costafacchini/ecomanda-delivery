import { transformChatBody } from '../services/ChatMessage'
import { jobDependencies } from './dependencies'

export default {
  key: 'chat-message',
  workerEnabled: true,
  async handle(data: any) {
    return await transformChatBody(data.body, jobDependencies)
  },
}
