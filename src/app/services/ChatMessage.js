const Body = require('@models/Body')
const createChatPlugin = require('../plugins/chats/factory')

async function transformChatBody(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const licensee = body.licensee

  const chatPlugin = createChatPlugin(licensee)

  const actions = []
  const messages = await chatPlugin.responseToMessages(body.content)

  for (const message of messages) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.whatsappUrl,
      token: licensee.whatsappToken,
    }

    actions.push({
      action: chatPlugin.action(body.content),
      body: bodyToSend,
    })
  }

  await Body.deleteOne({ _id: bodyId })

  return actions
}

module.exports = transformChatBody
