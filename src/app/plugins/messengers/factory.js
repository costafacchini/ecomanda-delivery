import { Utalk } from './Utalk.js'
import { Dialog } from './Dialog.js'
import { YCloud } from './YCloud.js'

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

export { createMessengerPlugin }
