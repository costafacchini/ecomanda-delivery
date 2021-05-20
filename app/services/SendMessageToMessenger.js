const createMessengerPlugin = require('../plugins/messengers/factory')

async function sendMessageToMessenger(body, licensee) {
  const messegnerPlugin = createMessengerPlugin(licensee)

  await messegnerPlugin.sendMessage(body.messageId, body.url, body.token)
}

module.exports = sendMessageToMessenger
