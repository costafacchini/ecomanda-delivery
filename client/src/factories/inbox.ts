import { Factory } from 'fishery'
import type { IInbox } from '../types/inbox'

const inboxFactory = Factory.define<IInbox>(({ sequence }) => ({
  _id: String(sequence),
  id: String(sequence),
  name: `Inbox ${sequence}`,
  licensee: 'licensee-1',
  kind: 'messenger',
  whatsappDefault: 'baileys',
  whatsappToken: '',
  whatsappUrl: '',
  inboxToken: `token-${sequence}`,
  webhookUrl: null,
  active: true,
}))

export { inboxFactory }
