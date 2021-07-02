const Body = require('@models/Body')
const createMessengerPlugin = require('../plugins/messengers/factory')

async function transformMessengerBody(data) {
  const { bodyId } = data
  const body = await Body.findById(bodyId).populate('licensee')
  const licensee = body.licensee

  const messengerPlugin = createMessengerPlugin(licensee)

  const actions = []
  const messages = await messengerPlugin.responseToMessages(body.content)

  for (const message of messages) {
    const action = messengerPlugin.action(message.destination)
    const url = message.destination === 'to-chat' ? licensee.chatUrl : licensee.chatbotUrl
    const token = message.destination === 'to-chat' ? '' : licensee.chatbotAuthorizationToken

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

  body.concluded = true
  await body.save()

  return actions
}

module.exports = transformMessengerBody
