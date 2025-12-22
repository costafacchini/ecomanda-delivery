import Body from '../models/Body.js'
import { createChatPlugin } from '../plugins/chats/factory.js'
import { ContactRepositoryDatabase } from '../repositories/contact.js'
import { MessageRepositoryDatabase } from '../repositories/message.js'

async function transformChatBody(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  if (!body) {
    return []
  }
  const licensee = body.licensee

  const chatPlugin = createChatPlugin(licensee)

  const actions = []
  const messages = await chatPlugin.responseToMessages(body.content)

  for (const message of messages) {
    if (licensee.useWhatsappWindow) {
      const contactRepository = new ContactRepositoryDatabase()
      const messageDoesNotHaveSended = await contactRepository.contactWithWhatsappWindowClosed(message.contact._id)
      if (messageDoesNotHaveSended && message.kind !== 'template') {
        const messageRepository = new MessageRepositoryDatabase()
        const messageToSend = await messageRepository.createMessageToWarnAboutWindowOfWhatsassHasExpired(
          message.contact,
          licensee,
        )

        const bodyToSend = {
          messageId: messageToSend._id,
          contactId: message.contact._id,
          licenseeId: licensee._id,
          url: licensee.chatUrl,
          token: '',
        }

        actions.push({
          action: 'send-message-to-chat',
          body: bodyToSend,
        })

        break
      }
    }

    const bodyToSend = {
      messageId: message._id,
      contactId: message.contact._id,
      licenseeId: licensee._id,
      url: licensee.whatsappUrl,
      token: licensee.whatsappToken,
    }

    actions.push({
      action: chatPlugin.action(body.content),
      body: bodyToSend,
    })
  }

  await Body.deleteOne({ _id: bodyId })

  return actions
}

export { transformChatBody }
