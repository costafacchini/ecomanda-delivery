import Body from '@models/Body.js'
import createMessengerPlugin from '../plugins/messengers/factory.js'

async function transformMessengerBody(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const licensee = body.licensee

  const messengerPlugin = createMessengerPlugin(licensee)

  const actions = []
  const messages = await messengerPlugin.responseToMessages(body.content)

  for (const message of messages) {
    const action = messengerPlugin.action(message.destination)
    let url, token
    if (message.destination === 'to-chat') {
      url = licensee.chatUrl
      token = ''
    } else if (message.destination === 'to-messenger') {
      url = licensee.whatsappUrl
      token = licensee.whatsappToken
    } else {
      url = licensee.chatbotUrl
      token = licensee.chatbotAuthorizationToken
    }

    const bodyToSend = {
      messageId: message._id,
      url,
      token,
    }

    actions.push({
      action,
      body: bodyToSend,
    })
  }

  await Body.deleteOne({ _id: bodyId })

  return actions
}

export default transformMessengerBody
