const createChatPlugin = require('../plugins/chats/factory')

async function closeChat(messageId, licensee) {
  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.closeChat(messageId, licensee)
}

module.exports = closeChat
