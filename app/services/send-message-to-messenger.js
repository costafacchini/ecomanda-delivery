const createMessengerPlugin = require('../plugins/messengers/factory')

async function sendMessageToMessenger(body, licensee) {
  const messegnerPlugin = createMessengerPlugin(licensee, body)

  await messegnerPlugin.sendMessage()
}

module.exports = sendMessageToMessenger
