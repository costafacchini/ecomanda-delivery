import { resetChats } from '../services/ResetChats.js'

export default {
  key: 'reset-chats',
  workerEnabled: true,
  async handle(data) {
    return await resetChats(data.body)
  },
}
