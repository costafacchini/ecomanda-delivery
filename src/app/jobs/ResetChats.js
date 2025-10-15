import { resetChats } from '../services/ResetChats.js'

export default {
  key: 'reset-chats',
  async handle(data) {
    return await resetChats(data.body)
  },
}
