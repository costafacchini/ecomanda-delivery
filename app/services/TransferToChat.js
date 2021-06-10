const Message = require('@models/Message')
const createChatPlugin = require('../plugins/chats/factory')

async function transferToChat(data) {
  const { messageId, url } = data
  const message = await Message.findById(messageId).populate('licensee')
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.transfer(messageId, url)
}

module.exports = transferToChat
