const createChatPlugin = require('../plugins/chats/factory')

async function sendMessageToChat(body, licensee) {
  const chatPlugin = createChatPlugin(licensee, body)

  await chatPlugin.sendMessage()
}

module.exports = sendMessageToChat
