import createChatbotPlugin from '../plugins/chatbots/factory.js'
import { MessageRepositoryDatabase  } from '@repositories/message.js'

async function sendMessageToChatbot(data) {
  const { messageId, url, token } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  await chatbotPlugin.sendMessage(messageId, url, token)
}

export default sendMessageToChatbot
