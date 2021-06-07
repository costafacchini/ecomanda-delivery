const createChatbotPlugin = require('../plugins/chatbots/factory')

async function sendMessageToChatbot(body, licensee) {
  const chatbotPlugin = createChatbotPlugin(licensee)

  await chatbotPlugin.sendMessage(body.messageId, body.url, body.token)
}

module.exports = sendMessageToChatbot
