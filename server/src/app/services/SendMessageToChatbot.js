const Message = require('@models/Message')
const createChatbotPlugin = require('../plugins/chatbots/factory')

async function sendMessageToChatbot(data) {
  const { messageId, url, token } = data
  const message = await Message.findById(messageId).populate('licensee')
  const licensee = message.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  await chatbotPlugin.sendMessage(messageId, url, token)
}

module.exports = sendMessageToChatbot
