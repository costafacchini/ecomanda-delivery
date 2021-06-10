const createMessengerPlugin = require('../plugins/messengers/factory')

async function transformMessengerBody(body, licensee) {
  const messengerPlugin = createMessengerPlugin(licensee)

  const actions = []
  const messages = await messengerPlugin.responseToMessages(body)

  for (const message of messages) {
    const action = messengerPlugin.action(message.destination)
    const url = message.destination === 'to-chat' ? licensee.chatUrl : licensee.chatbotUrl
    const token = message.destination === 'to-chat' ? '' : licensee.chatbotAuthorizationToken

    const bodyToSend = {
      messageId: message._id,
      url,
      token
    }

    actions.push({
      action,
      body: bodyToSend,
      licensee
    })
  }

  return actions
}

module.exports = transformMessengerBody
