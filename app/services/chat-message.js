const createChatPlugin = require('../plugins/chats/factory')
const { queue } = require('@config/queue-server')

async function transformChatBody(body, licensee) {
  const chatPlugin = createChatPlugin(licensee, body)

  if (chatPlugin.action !== '') {
    const chatData = {
      body: chatPlugin.transformdedBody,
      url: licensee.chatUrl
    }

    await queue.addJobDispatcher(chatPlugin.action, chatData, licensee)
  }
}

module.exports = transformChatBody