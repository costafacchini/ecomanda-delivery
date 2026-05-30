import { resetChatbots } from '../services/ResetChatbots'
import { jobDependencies } from './dependencies'

export default {
  key: 'reset-chatbots',
  workerEnabled: true,
  async handle(data) {
    return await resetChatbots(jobDependencies)
  },
}
