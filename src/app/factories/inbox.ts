import { Factory } from 'fishery'
import { licensee } from './licensee'

const inbox = Factory.define(() => ({
  active: true,
  name: 'Inbox',
  kind: 'messenger',
  whatsappDefault: 'baileys',
  licensee: licensee.build(),
}))

export { inbox }
