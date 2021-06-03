const createChatPlugin = require('../plugins/chats/factory')

async function closeChat(body, licensee) {
  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.closeChat(body.messageId, licensee)
}

module.exports = closeChat
