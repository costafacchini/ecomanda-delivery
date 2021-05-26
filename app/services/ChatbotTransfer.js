const createChatbotPlugin = require('../plugins/chatbots/factory')

async function transformChatbotTransferBody(body, licensee) {
  const chatbotPlugin = createChatbotPlugin(licensee)

  const actions = []
  const message = chatbotPlugin.responseTransferToMessage(body)

  if (message) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.chatUrl,
    }

    actions.push({
      action: 'transfer-to-chat',
      body: bodyToSend,
      licensee
    })
  }

  return actions
}

module.exports = transformChatbotTransferBody
