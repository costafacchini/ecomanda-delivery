import { Factory } from 'fishery'

const contactFactory = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Rosa',
}))

export { contactFactory }
