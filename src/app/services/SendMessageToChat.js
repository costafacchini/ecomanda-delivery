const createChatPlugin = require('../plugins/chats/factory')
const { MessageRepositoryDatabase } = require('@repositories/message')

async function sendMessageToChat(data) {
  const { messageId, url } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(messageId, url)
}

module.exports = sendMessageToChat
