import createChatPlugin from '../plugins/chats/factory.js'
import { MessageRepositoryDatabase  } from '@repositories/message.js'

async function sendMessageToChat(data) {
  const { messageId, url } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(messageId, url)
}

export default sendMessageToChat
