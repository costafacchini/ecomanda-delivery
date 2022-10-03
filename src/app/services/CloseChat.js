const Message = require('@models/Message')
const createChatPlugin = require('../plugins/chats/factory')
const { scheduleSendMessageToMessengerRabbit } = require('@repositories/messenger')

async function closeChat(data) {
  const { messageId } = data
  const message = await Message.findById(messageId).populate('licensee')
  const licensee = message.licensee

  const chatPlugin = createChatPlugin(licensee)

  const messagesOnCloseChat = await chatPlugin.closeChat(messageId)

  if (messagesOnCloseChat.length > 0) {
    for (const messageCloseChat of messagesOnCloseChat) {
      scheduleSendMessageToMessengerRabbit({
        messageId: messageCloseChat._id,
        url: licensee.whatsappUrl,
        token: licensee.whatsappToken,
      })
    }
  }
}

module.exports = closeChat
