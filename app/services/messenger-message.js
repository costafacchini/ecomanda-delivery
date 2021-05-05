const createMessengerPlugin = require('../plugins/messengers/factory')
const queueServer = require('@config/queue')

async function transformMessengerBody(body, licensee) {
  const messengerPlugin = createMessengerPlugin(licensee, body)

  const chatData = {
    body: messengerPlugin.transformdedBody,
    url: licensee.whatsappUrl,
    token: licensee.whatsappToken,
  }

  await queueServer.addJob(messengerPlugin.action, chatData, licensee)
}

module.exports = transformMessengerBody
