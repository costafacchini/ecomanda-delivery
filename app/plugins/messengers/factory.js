const Chatapi = require('./Chatapi')
const Utalk = require('./Utalk')
const Winzap = require('./Winzap')

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
