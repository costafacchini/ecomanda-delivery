import { Factory } from 'fishery'

const licenseeFactory = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Rosa',
}))

export { licenseeFactory }
