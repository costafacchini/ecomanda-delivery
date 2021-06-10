const createChatbotPlugin = require('../plugins/chatbots/factory')

async function transformChatbotBody(body, licensee) {
  const chatbotPlugin = createChatbotPlugin(licensee)

  const actions = []
  const messages = await chatbotPlugin.responseToMessages(body)

  for (const message of messages) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.whatsappUrl,
      token: licensee.whatsappToken,
    }

    actions.push({
      action: 'send-message-to-messenger',
      body: bodyToSend,
      licensee
    })
  }

  return actions
}

module.exports = transformChatbotBody
