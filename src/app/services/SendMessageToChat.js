import createChatPlugin from '../plugins/chats/factory'
import { MessageRepositoryDatabase } from '@repositories/message'

async function sendMessageToChat(data) {
  const { messageId, url } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(messageId, url)
}

export default sendMessageToChat
