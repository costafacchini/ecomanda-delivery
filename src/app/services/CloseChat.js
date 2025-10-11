import createChatPlugin from '../plugins/chats/factory'
import { MessageRepositoryDatabase } from '@repositories/message'

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

export default closeChat
