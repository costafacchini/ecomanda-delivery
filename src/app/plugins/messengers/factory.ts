import { Utalk } from './Utalk'
import { Dialog } from './Dialog'
import { YCloud } from './YCloud'
import { Pabbly } from './Pabbly'
import { Baileys } from './Baileys'

function createMessengerPlugin(licensee: any, dependencies = {}) {
  switch (licensee.whatsappDefault) {
    case 'utalk':
      return new Utalk(licensee, dependencies)
    case 'dialog':
      return new Dialog(licensee, dependencies)
    case 'ycloud':
      return new YCloud(licensee, dependencies)
    case 'pabbly':
      return new Pabbly(licensee, dependencies)
    case 'baileys':
      return new Baileys(licensee, dependencies)
    default:
      throw `Plugin de messenger não configurado: ${licensee.whatsappDefault}`
  }
}

export { createMessengerPlugin }
