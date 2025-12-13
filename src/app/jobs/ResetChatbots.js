import { resetChatbots } from '../services/ResetChatbots.js'

export default {
  key: 'reset-chatbots',
  workerEnabled: true,
  async handle(data) {
    return await resetChatbots(data.body)
  },
}
