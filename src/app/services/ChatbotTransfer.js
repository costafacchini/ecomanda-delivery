import { createChatbotPlugin } from '../plugins/chatbots/factory.js'
import { BodyRepositoryDatabase } from '../repositories/body.js'

async function transformChatbotTransferBody(data, { bodyRepository = new BodyRepositoryDatabase() } = {}) {
  const { bodyId } = data
  const body = await bodyRepository.findFirst({ _id: bodyId }, ['licensee'])
  const licensee = body.licensee

  const chatbotPlugin = createChatbotPlugin(licensee)

  const actions = []
  const message = await chatbotPlugin.responseTransferToMessage(body.content)

  if (message) {
    const bodyToSend = {
      messageId: message._id,
      contactId: message.contact._id,
      licenseeId: licensee._id,
      url: licensee.chatUrl,
    }

    actions.push({
      action: 'transfer-to-chat',
      body: bodyToSend,
    })
  }

  await bodyRepository.delete({ _id: bodyId })

  return actions
}

export { transformChatbotTransferBody }
