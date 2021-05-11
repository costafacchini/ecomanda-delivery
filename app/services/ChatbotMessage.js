const createChatbotPlugin = require('../plugins/chatbots/factory')
const queueServer = require('@config/queue')

async function transformChatbotBody(body, licensee) {
  const chatbotPlugin = createChatbotPlugin(licensee)

  const messages = chatbotPlugin.responseToMessages(body)
  for (const message of messages) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.chatbotUrl,
      token: licensee.chatbotAuthorizationToken,
    }

    await queueServer.addJob('send-message-to-messenger', bodyToSend, licensee)
  }
}

module.exports = transformChatbotBody
