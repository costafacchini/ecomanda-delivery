import { Factory } from 'fishery'

const triggerFactory = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Gatilho',
}))

export { triggerFactory }
