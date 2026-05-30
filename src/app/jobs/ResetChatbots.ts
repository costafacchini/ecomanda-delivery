import { resetChatbots } from '../services/ResetChatbots'
import { jobDependencies } from './dependencies'

export default {
  key: 'reset-chatbots',
  workerEnabled: true,
  async handle(data: any) {
    return await resetChatbots(jobDependencies)
  },
}
