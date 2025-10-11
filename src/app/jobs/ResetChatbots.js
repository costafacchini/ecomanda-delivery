import resetChatbots from '../services/ResetChatbots'

export default {
  key: 'reset-chatbots',
  async handle(data) {
    return await resetChatbots(data.body)
  },
}
