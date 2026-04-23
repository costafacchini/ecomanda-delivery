import { createChatPlugin } from '../plugins/chats/factory.js'
import { MessageRepositoryDatabase } from '../repositories/message.js'

async function transferToChat(data, { messageRepository = new MessageRepositoryDatabase() } = {}) {
  const { messageId, url } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.transfer(messageId, url)
}

export { transferToChat }
