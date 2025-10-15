import { closeChat } from '../services/CloseChat.js'

export default {
  key: 'close-chat',
  async handle(data) {
    return await closeChat(data.body)
  },
}
