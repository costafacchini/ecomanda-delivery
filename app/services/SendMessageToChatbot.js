const createChatbotPlugin = require('../plugins/chatbots/factory')

async function sendMessageToChatbot(body, licensee) {
  const chatbotPlugin = createChatbotPlugin('send-message', licensee, body)

  await chatbotPlugin.sendMessage()
}

module.exports = sendMessageToChatbot
