const Message = require('@models/Message')
const createMessengerPlugin = require('../plugins/messengers/factory')

async function sendMessageToMessenger(data) {
  const { messageId, url, token } = data
  const message = await Message.findById(messageId).populate('licensee')
  const licensee = message.licensee

  const messegnerPlugin = createMessengerPlugin(licensee)

  await messegnerPlugin.sendMessage(messageId, url, token)
}

module.exports = sendMessageToMessenger
