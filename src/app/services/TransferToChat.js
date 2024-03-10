const createChatPlugin = require('../plugins/chats/factory')
const { MessageRepositoryDatabase } = require('@repositories/message')

async function transferToChat(data) {
  const { messageId, url } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.transfer(messageId, url)
}

module.exports = transferToChat
