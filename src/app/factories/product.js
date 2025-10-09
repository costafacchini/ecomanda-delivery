import { Factory  } from 'fishery'
import { licensee  } from './licensee.js'

const product = Factory.define(() => ({
  name: 'Product 1',
  licensee: licensee.build(),
}))

export default { product }
