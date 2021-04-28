const createChatbotPlugin = require('../plugins/messengers/factory')

async function sendMessageToChatbot(body, licensee) {
  const chatbotPlugin = createChatbotPlugin(body, licensee)

  await chatbotPlugin.sendMessage()
}

module.exports = sendMessageToChatbot
