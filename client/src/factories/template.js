import { Factory } from 'fishery'
import { licenseeFactory } from './licensee'

const templateFactory = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'template',
  namespace: 'Namespace',
  licensee: licenseeFactory.build(),
}))

export { templateFactory }
