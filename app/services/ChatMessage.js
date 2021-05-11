const createChatPlugin = require('../plugins/chats/factory')
const queueServer = require('@config/queue')

async function transformChatBody(body, licensee) {
  const chatPlugin = createChatPlugin(licensee, body)

  if (chatPlugin.action !== '') {
    const chatData = {
      body: chatPlugin.transformdedBody,
      url: licensee.chatUrl,
    }

    await queueServer.addJob(chatPlugin.action, chatData, licensee)
  }
}

module.exports = transformChatBody
