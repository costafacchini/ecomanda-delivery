import { Factory } from 'fishery'
import { licensee } from './licensee'

const template = Factory.define(() => ({
  name: 'template',
  namespace: 'Namespace',
  licensee: licensee.build(),
}))

export { template }
