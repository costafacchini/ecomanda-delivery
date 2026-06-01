import { Factory } from 'fishery'

const messageFactory = Factory.define(({ sequence }) => ({
  id: sequence,
  kind: 'text',
  text: 'Hello World',
}))

export { messageFactory }
