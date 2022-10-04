const Message = require('@models/Message')
const createChatPlugin = require('../plugins/chats/factory')

async function closeChat(data) {
  const { messageId } = data
  const message = await Message.findById(messageId).populate('licensee')
  const licensee = message.licensee
  const actions = []

  const chatPlugin = createChatPlugin(licensee)

  const messagesOnCloseChat = await chatPlugin.closeChat(messageId)

  if (messagesOnCloseChat.length > 0) {
    for (const messageCloseChat of messagesOnCloseChat) {
      const bodyToSend = {
        messageId: messageCloseChat._id,
        url: licensee.whatsappUrl,
        token: licensee.whatsappToken,
      }

      actions.push({
        action: 'send-message-to-messenger',
        body: bodyToSend,
      })
    }
  }

  return actions
}

module.exports = closeChat
