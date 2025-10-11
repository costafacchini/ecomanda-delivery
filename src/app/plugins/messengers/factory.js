import Utalk from './Utalk'
import Dialog from './Dialog'
import YCloud from './YCloud'

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

export default createMessengerPlugin
