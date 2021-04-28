const createPlugin = require('../plugins/chats/factory')

async function closeChat(body, licensee) {
  const chatPlugin = createPlugin(licensee, body)

  await chatPlugin.closeChat()
}

module.exports = closeChat
