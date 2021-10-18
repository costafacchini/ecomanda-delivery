const Body = require('@models/Body')
const createChatbotPlugin = require('../plugins/chatbots/factory')

async function transformChatbotTransferBody(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const licensee = body.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  const actions = []
  const message = await chatbotPlugin.responseTransferToMessage(body.content)

  if (message) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.chatUrl,
    }

    actions.push({
      action: 'transfer-to-chat',
      body: bodyToSend,
    })
  }

  await Body.deleteOne({ _id: bodyId })

  return actions
}

module.exports = transformChatbotTransferBody
