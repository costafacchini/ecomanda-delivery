import { resetChatbots } from '../services/ResetChatbots'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'reset-chatbots',
  workerEnabled: true,
  async handle(data) {
    return await resetChatbots(data.body, jobDependencies)
  },
}
