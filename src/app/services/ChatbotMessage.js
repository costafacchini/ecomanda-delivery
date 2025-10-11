import Body from '@models/Body'
import createChatbotPlugin from '../plugins/chatbots/factory'

async function transformChatbotBody(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const licensee = body.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  const actions = []
  const messages = await chatbotPlugin.responseToMessages(body.content)

  for (const message of messages) {
    const bodyToSend = {
      messageId: message._id,
      url: licensee.whatsappUrl,
      token: licensee.whatsappToken,
    }

    actions.push({
      action: 'send-message-to-messenger',
      body: bodyToSend,
    })
  }

  await Body.deleteOne({ _id: bodyId })

  return actions
}

export default transformChatbotBody
