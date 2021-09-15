const Chatapi = require('./Chatapi')
const Utalk = require('./Utalk')
const Winzap = require('./Winzap')

function createMessengerPlugin(licensee) {
  switch (licensee.whatsappDefault) {
    case 'chatapi':
      return new Chatapi(licensee)
    case 'utalk':
      return new Utalk(licensee)
    case 'winzap':
      return new Winzap(licensee)
    default:
      throw `Plugin de messenger não configurado: ${licensee.whatsappDefault}`
  }
}

module.exports = createMessengerPlugin
