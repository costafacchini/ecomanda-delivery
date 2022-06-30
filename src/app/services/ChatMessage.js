const Body = require('@models/Body')
const createChatPlugin = require('../plugins/chats/factory')
const { contactWithWhatsappWindowClosed } = require('@repositories/contact')
const { createMessageToWarnAboutWindowOfWhatsassClosed } = require('@repositories/message')

async function transformChatBody(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const licensee = body.licensee

  const chatPlugin = createChatPlugin(licensee)

  const actions = []
  const messages = await chatPlugin.responseToMessages(body.content)

  for (const message of messages) {
    if (licensee.useWhatsappWindow) {
      const messageDoesNotHaveSended = await contactWithWhatsappWindowClosed(message.contact._id)
      if (messageDoesNotHaveSended && message.kind !== 'template') {
        const messageToSend = await createMessageToWarnAboutWindowOfWhatsassClosed(message.contact, licensee)

        const bodyToSend = {
          messageId: messageToSend._id,
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

module.exports = transformChatBody
