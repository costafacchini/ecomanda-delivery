import transferToChat from '../services/TransferToChat.js'

export default {
  key: 'transfer-to-chat',
  async handle(data) {
    return await transferToChat(data.body)
  },
}
