const createChatPlugin = require('../plugins/chats/factory')

async function transformChatBody(body, licensee) {
  const chatPlugin = createChatPlugin(licensee)

  const actions = []
  const messages = chatPlugin.responseToMessages(body)

  for (const message of messages) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.whatsappUrl,
      token: licensee.whatsappToken,
    }

    actions.push({
      action: chatPlugin.action(body),
      body: bodyToSend,
      licensee
    })
  }

  return actions
}

module.exports = transformChatBody
