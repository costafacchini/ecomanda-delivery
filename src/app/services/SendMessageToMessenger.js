const createMessengerPlugin = require('../plugins/messengers/factory')
const { MessageRepositoryDatabase } = require('@repositories/message')

async function sendMessageToMessenger(data) {
  const { messageId, url, token } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee

  const messegnerPlugin = createMessengerPlugin(licensee)

  await messegnerPlugin.sendMessage(messageId, url, token)
}

module.exports = sendMessageToMessenger
