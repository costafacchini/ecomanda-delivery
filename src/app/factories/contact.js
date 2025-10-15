import { Factory } from 'fishery'
import { licensee } from './licensee'

const contact = Factory.define(() => ({
  number: '5511990283745',
  talkingWithChatBot: false,
  licensee: licensee.build(),
}))

export { contact }
