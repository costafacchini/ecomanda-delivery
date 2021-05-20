const createMessengerPlugin = require('../plugins/messengers/factory')
const queueServer = require('@config/queue')

async function transformMessengerBody(body, licensee) {
  const messengerPlugin = createMessengerPlugin(licensee)

  const messages = messengerPlugin.responseToMessages(body)
  for (const message of messages) {
    const action = messengerPlugin.action(message.destination)
    const url = message.destination === 'to-chat' ? licensee.chatUrl : licensee.chatbotUrl
    const token = message.destination === 'to-chat' ? '' : licensee.chatbotAuthorizationToken

    const bodyToSend = {
      messageId: message._id,
      url,
      token
    }

    await queueServer.addJob(action, bodyToSend, licensee)
  }
}

module.exports = transformMessengerBody
