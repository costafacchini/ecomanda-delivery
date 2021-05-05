const createChatbotPlugin = require('../plugins/chatbots/factory')
const queueServer = require('@config/queue')

async function transformChatbotBody(body, licensee) {
  const chatbotPlugin = createChatbotPlugin('send-message', licensee, body)

  const chatData = {
    body: chatbotPlugin.transformdedBody,
    url: licensee.chatbotUrl,
    token: licensee.chatbotAuthorizationToken,
  }

  await queueServer.addJob(chatbotPlugin.action, chatData, licensee)
}

module.exports = transformChatbotBody
