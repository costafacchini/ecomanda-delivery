const createChatPlugin = require('../plugins/chat/factory')

async function sendMessageToChat(body, licensee) {
  const messegnerPlugin = createChatPlugin(body, licensee)

  await messegnerPlugin.sendMessage()
}

module.exports = sendMessageToChat
