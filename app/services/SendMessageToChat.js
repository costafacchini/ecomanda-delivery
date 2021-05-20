const createChatPlugin = require('../plugins/chats/factory')

async function sendMessageToChat(body, licensee) {
  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.sendMessage(body.messageId, body.url, body.token)
}

module.exports = sendMessageToChat
