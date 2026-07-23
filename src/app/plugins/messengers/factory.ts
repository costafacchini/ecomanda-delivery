import { Utalk } from './Utalk'
import { Dialog } from './Dialog'
import { YCloud } from './YCloud'
import { Pabbly } from './Pabbly'
import { Baileys } from './Baileys'

function createMessengerPlugin(licensee: any, dependencies = {}, inbox: any = null) {
  const plugin = (inbox as any)?.whatsappDefault || licensee.whatsappDefault
  switch (plugin) {
    case 'utalk':
      return new Utalk(licensee, dependencies)
    case 'dialog':
      return new Dialog(licensee, dependencies)
    case 'ycloud':
      return new YCloud(licensee, dependencies)
    case 'pabbly':
      return new Pabbly(licensee, dependencies)
    case 'baileys':
      return new Baileys(licensee, { ...(dependencies as Record<string, any>), inbox })
    default:
      throw `Plugin de messenger não configurado: ${plugin}`
  }
}

export { createMessengerPlugin }
