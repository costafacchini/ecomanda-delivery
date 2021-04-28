const createChatbotPlugin = require('../plugins/chatbots/factory')
const { queue } = require('@config/queue-server')

async function transformChatbotTransferBody(body, licensee) {
  const chatbotPlugin = createChatbotPlugin('transfer', licensee, body)

  if (chatbotPlugin.action !== '') {
    const chatData = {
      body: chatbotPlugin.transformdedBody,
      url: licensee.whatsappUrl,
      token: licensee.whatsappToken,
    }

    await queue.addJobDispatcher(chatbotPlugin.action, chatData, licensee)
  }
}

module.exports = transformChatbotTransferBody