import { createChatbotPlugin } from '../plugins/chatbots/factory.js'
import { BodyRepositoryDatabase } from '../repositories/body.js'

async function transformChatbotBody(data, { bodyRepository = new BodyRepositoryDatabase() } = {}) {
  const { bodyId } = data
  const body = await bodyRepository.findFirst({ _id: bodyId }, ['licensee'])
  const licensee = body.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  const actions = []
  const messages = await chatbotPlugin.responseToMessages(body.content)

  for (const message of messages) {
    const bodyToSend = {
      messageId: message._id,
      contactId: message.contact._id,
      licenseeId: licensee._id,
      url: licensee.whatsappUrl,
      token: licensee.whatsappToken,
    }

    actions.push({
      action: 'send-message-to-messenger',
      body: bodyToSend,
    })
  }

  await bodyRepository.delete({ _id: bodyId })

  return actions
}

export { transformChatbotBody }
