const createChatPlugin = require('../plugins/chats/factory')

async function transferToChat(body, licensee) {
  const chatPlugin = createChatPlugin(licensee)

  await chatPlugin.transfer(body.messageId, body.url, body.token)
}

module.exports = transferToChat
