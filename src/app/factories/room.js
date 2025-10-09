import { Factory  } from 'fishery'
import { contact  } from './contact.js'

const room = Factory.define(() => ({
  roomId: 'ka3DiV9CuHD765',
  token: 'token',
  contact: contact.build(),
  closed: false,
}))

export default { room }
