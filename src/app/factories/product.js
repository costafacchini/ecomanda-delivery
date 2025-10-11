import { Factory } from 'fishery'
import { licensee } from './licensee'

const product = Factory.define(() => ({
  name: 'Product 1',
  licensee: licensee.build(),
}))

export { product }
