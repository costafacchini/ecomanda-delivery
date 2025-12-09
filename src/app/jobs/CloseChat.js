import { closeChat } from '../services/CloseChat.js'

export default {
  key: 'close-chat',
  workerEnabled: true,
  async handle(data) {
    return await closeChat(data.body)
  },
}
