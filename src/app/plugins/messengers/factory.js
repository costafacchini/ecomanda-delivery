const Utalk = require('./Utalk')
const Dialog = require('./Dialog')
const YCloud = require('./YCloud')

function createMessengerPlugin(licensee) {
  switch (licensee.whatsappDefault) {
    case 'utalk':
      return new Utalk(licensee)
    case 'dialog':
      return new Dialog(licensee)
    case 'ycloud':
      return new YCloud(licensee)
    default:
      throw `Plugin de messenger não configurado: ${licensee.whatsappDefault}`
  }
}

module.exports = createMessengerPlugin
