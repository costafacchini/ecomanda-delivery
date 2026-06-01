import { closeChat } from '../services/CloseChat'
import { jobDependencies } from './dependencies'

export default {
  key: 'close-chat',
  workerEnabled: true,
  async handle(data: any) {
    return await closeChat(data.body, jobDependencies)
  },
}
