import closeChat from '../services/CloseChat'

export default {
  key: 'close-chat',
  async handle(data) {
    return await closeChat(data.body)
  },
}
