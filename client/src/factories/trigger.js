import { Factory } from 'fishery'
const { licenseeFactory } = require('./licensee')

const triggerFactory = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Gatilho',
  expression: 'hello-trigger',
  order: 1,
  triggerKind: 'multi_product',
  catalogMulti: 'catalog',
  licensee: licenseeFactory.build(),
}))

export { triggerFactory }
