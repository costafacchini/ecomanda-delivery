const createChatbotPlugin = require('../plugins/chatbots/factory')
const queueServer = require('@config/queue')

async function transformChatbotTransferBody(body, licensee) {
  const chatbotPlugin = createChatbotPlugin(licensee)

  const message = chatbotPlugin.responseTransferToMessage(body)

  if (message) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.chatUrl,
    }

    await queueServer.addJob('transfer-to-chat', bodyToSend, licensee)
  }
}

module.exports = transformChatbotTransferBody
