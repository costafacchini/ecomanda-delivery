import { createChatPlugin } from '../plugins/chats/factory.js'
import { MessageRepositoryDatabase } from '../repositories/message.js'

async function closeChat(data) {
  const { messageId } = data
  const messageRepository = new MessageRepositoryDatabase()
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee
  const actions = []

  const chatPlugin = createChatPlugin(licensee)

  const messagesOnCloseChat = await chatPlugin.closeChat(messageId)

  if (messagesOnCloseChat.length > 0) {
    for (const messageCloseChat of messagesOnCloseChat) {
      const bodyToSend = {
        messageId: messageCloseChat._id,
        contactId: message.contact._id,
        licenseeId: licensee._id,
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

export { closeChat }
