const createMessengerPlugin = require('../plugins/messengers/factory')

async function sendMessageToMessenger(body, licensee) {
  const messegnerPlugin = createMessengerPlugin(body, licensee)

  await messegnerPlugin.sendMessage()
}

module.exports = sendMessageToMessenger
