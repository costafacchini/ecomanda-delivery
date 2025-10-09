import { Factory  } from 'fishery'
import { licensee  } from './licensee.js'

const backgroundjob = Factory.define(() => ({
  status: 'scheduled',
  kind: 'get-pix',
  body: {
    cart_id: 'cart-id',
  },
  licensee: licensee.build(),
}))

export default { backgroundjob }
