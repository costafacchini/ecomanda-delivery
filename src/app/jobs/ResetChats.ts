import { resetChats } from '../services/ResetChats'
import { jobDependencies } from './dependencies'

export default {
  key: 'reset-chats',
  workerEnabled: true,
  async handle(data: any) {
    return await resetChats(jobDependencies)
  },
}
