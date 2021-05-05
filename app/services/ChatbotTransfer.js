const createChatbotPlugin = require('../plugins/chatbots/factory')
const queueServer = require('@config/queue')

async function transformChatbotTransferBody(body, licensee) {
  const chatbotPlugin = createChatbotPlugin('transfer', licensee, body)

  const chatData = {
    body: chatbotPlugin.transformdedBody,
    url: licensee.whatsappUrl,
    token: licensee.whatsappToken,
  }

  await queueServer.addJob(chatbotPlugin.action, chatData, licensee)
}

module.exports = transformChatbotTransferBody
