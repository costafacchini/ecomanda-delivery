const Message = require('@models/Message')
const createChatPlugin = require('../plugins/chats/factory')

async function sendMessageToChat(data) {
  const { messageId, url } = data
  const message = await Message.findById(messageId).populate('licensee')
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(messageId, url)
}

module.exports = sendMessageToChat
