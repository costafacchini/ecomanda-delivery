const Chatapi = require('../messengers/chatapi')
const Utalk = require('../messengers/utalk')
const Winzap = require('../messengers/winzap')

function createMessengerPlugin(licensee, body) {
  switch (licensee.whatsappDefault) {
    case 'chatapi':
      return new Chatapi(body)
    case 'utalk':
      return new Utalk(body)
    case 'winzap':
      return new Winzap(body)
    default:
      throw `Plugin de messenger não configurado: ${licensee.whatsappDefault}`
  }
}

module.exports = createMessengerPlugin
