import resetChats from '../services/ResetChats'

export default {
  key: 'reset-chats',
  async handle(data) {
    return await resetChats(data.body)
  },
}
