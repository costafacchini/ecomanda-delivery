import { Factory  } from 'fishery'
import { licensee  } from './licensee.js'

const body = Factory.define(() => ({
  content: {
    message: 'text',
  },
  kind: 'normal',
  licensee: licensee.build(),
}))

export default { body }
