const createChatPlugin = require('../plugins/chats/factory')
const queueServer = require('@config/queue')

async function transformChatBody(body, licensee) {
  const chatPlugin = createChatPlugin(licensee)

  const message = chatPlugin.responseToMessage(body)

  if (message) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.whatsappUrl,
      token: licensee.whatsappToken,
    }

    await queueServer.addJob(chatPlugin.action(body), bodyToSend, licensee)
  }
}

module.exports = transformChatBody
