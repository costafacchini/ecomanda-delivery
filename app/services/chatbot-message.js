const createChatbotPlugin = require('../plugins/chatbots/factory')
const { queue } = require('@config/queue-server')

async function transformChatbotBody(body, licensee) {
  const chatbotPlugin = createChatbotPlugin('send-message', licensee, body)

  if (chatbotPlugin.action !== '') {
    const chatData = {
      body: chatbotPlugin.transformdedBody,
      url: licensee.chatbotUrl,
      token: licensee.chatbotAuthorizationToken,
    }

    await queue.addJobDispatcher(chatbotPlugin.action, chatData, licensee)
  }
}

module.exports = transformChatbotBody