import transferToChat from '../services/TransferToChat'

export default {
  key: 'transfer-to-chat',
  async handle(data) {
    return await transferToChat(data.body)
  },
}
