import { resetChats } from '../services/ResetChats.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'reset-chats',
  workerEnabled: true,
  async handle(data) {
    return await resetChats(data.body, jobDependencies)
  },
}
