import { Utalk } from './Utalk.js'
import { Dialog } from './Dialog.js'
import { YCloud } from './YCloud.js'
import { Pabbly } from './Pabbly.js'

function createMessengerPlugin(licensee, dependencies = {}) {
  switch (licensee.whatsappDefault) {
    case 'utalk':
      return new Utalk(licensee, dependencies)
    case 'dialog':
      return new Dialog(licensee, dependencies)
    case 'ycloud':
      return new YCloud(licensee, dependencies)
    case 'pabbly':
      return new Pabbly(licensee, dependencies)
    default:
      throw `Plugin de messenger não configurado: ${licensee.whatsappDefault}`
  }
}

export { createMessengerPlugin }
