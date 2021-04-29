const createChatPlugin = require('../plugins/chats/factory')

async function closeChat(body, licensee) {
  const chatPlugin = createChatPlugin(licensee, body)

  await chatPlugin.closeChat()
}

module.exports = closeChat
