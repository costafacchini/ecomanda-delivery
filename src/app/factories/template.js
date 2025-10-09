import { Factory  } from 'fishery'
import { licensee  } from './licensee.js'

const template = Factory.define(() => ({
  name: 'template',
  namespace: 'Namespace',
  licensee: licensee.build(),
}))

export default { template }
