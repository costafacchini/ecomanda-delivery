import { Factory } from 'fishery'
const { licenseeFactory } = require('./licensee')

const templateFactory = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'template',
  namespace: 'Namespace',
  licensee: licenseeFactory.build(),
}))

export { templateFactory }
