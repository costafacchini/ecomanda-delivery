import { Factory } from 'fishery'

const messageFactory = Factory.define(({ sequence }) => ({
  _id: sequence,
  kind: 'text',
  text: 'Hello World',
}));

export { messageFactory }
