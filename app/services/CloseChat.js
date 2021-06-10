const Message = require('@models/Message')
const createChatPlugin = require('../plugins/chats/factory')

async function closeChat(data) {
  const { messageId } = data
  const message = await Message.findById(messageId).populate('licensee')
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.closeChat(messageId)
}

module.exports = closeChat
