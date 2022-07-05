const Utalk = require('./Utalk')
const Dialog = require('./Dialog')

function createMessengerPlugin(licensee) {
  switch (licensee.whatsappDefault) {
    case 'utalk':
      return new Utalk(licensee)
    case 'dialog':
      return new Dialog(licensee)
    default:
      throw `Plugin de messenger não configurado: ${licensee.whatsappDefault}`
  }
}

module.exports = createMessengerPlugin
