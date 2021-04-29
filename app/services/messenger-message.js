const createMessengerPlugin = require('../plugins/messengers/factory')
const { queue } = require('@config/queue-server')

async function transformMessengerBody(body, licensee) {
  const messengerPlugin = createMessengerPlugin(licensee, body)

  const chatData = {
    body: messengerPlugin.transformdedBody,
    url: licensee.whatsappUrl,
    token: licensee.whatsappToken,
  }

  await queue.addJobDispatcher(messengerPlugin.action, chatData, licensee)
}

module.exports = transformMessengerBody