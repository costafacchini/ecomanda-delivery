import createChatbotPlugin from '../plugins/chatbots/factory'
import { MessageRepositoryDatabase } from '@repositories/message'

async function sendMessageToChatbot(data) {
  const { messageId, url, token } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  await chatbotPlugin.sendMessage(messageId, url, token)
}

export default sendMessageToChatbot
