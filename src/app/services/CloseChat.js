import { createChatPlugin } from '../plugins/chats/factory.js'
import { MessageRepositoryDatabase } from '../repositories/message.js'

async function closeChat(data, { messageRepository = new MessageRepositoryDatabase() } = {}) {
  const { messageId } = data
  const message = await messageRepository.findFirst({ _id: messageId }, ['licensee'])
  const licensee = message.licensee
  const actions = []

  const chatPlugin = createChatPlugin(licensee)

  const messagesOnCloseChat = await chatPlugin.closeChat(messageId)

  if (messagesOnCloseChat.length > 0) {
    for (const messageCloseChat of messagesOnCloseChat) {
      const contactId = message.contact?._id ?? message.contact

      const bodyToSend = {
        messageId: messageCloseChat._id,
        contactId,
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
