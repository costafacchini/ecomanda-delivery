const createChatPlugin = require('../plugins/chats/factory')

async function transferToChat(body, licensee) {
  const chatPlugin = createChatPlugin(licensee, body)

  await chatPlugin.sendMessage()
}

module.exports = transferToChat
