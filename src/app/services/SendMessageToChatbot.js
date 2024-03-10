const createChatbotPlugin = require('../plugins/chatbots/factory')
const { MessageRepositoryDatabase } = require('@repositories/message')

async function sendMessageToChatbot(data) {
  const { messageId, url, token } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  await chatbotPlugin.sendMessage(messageId, url, token)
}

module.exports = sendMessageToChatbot
