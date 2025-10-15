import { Factory } from 'fishery'
import { licensee } from './licensee'

const backgroundjob = Factory.define(() => ({
  status: 'scheduled',
  kind: 'get-pix',
  body: {
    cart_id: 'cart-id',
  },
  licensee: licensee.build(),
}))

export { backgroundjob }
