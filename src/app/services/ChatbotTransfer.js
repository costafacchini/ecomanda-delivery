import Body from '../models/Body.js'
import { createChatbotPlugin } from '../plugins/chatbots/factory.js'

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

export { transformChatbotTransferBody }
