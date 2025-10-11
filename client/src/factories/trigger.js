import { Factory } from 'fishery'
import { licenseeFactory } from './licensee'

const triggerFactory = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Gatilho',
  expression: 'hello-trigger',
  order: 1,
  triggerKind: 'multi_product',
  catalogMulti: 'catalog',
  licensee: licenseeFactory.build(),
}))

const triggerSingleProduct = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Send single product',
  expression: 'send_single_product',
  triggerKind: 'single_product',
  catalogSingle: 'product',
  licensee: licenseeFactory.build(),
  order: 1,
}))

const triggerReplyButton = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Send reply buttons',
  expression: 'send_reply_buttons',
  triggerKind: 'reply_button',
  textReplyButton: 'buttons',
  licensee: licenseeFactory.build(),
  order: 1,
}))

const triggerListMessage = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Send list message',
  expression: 'send_list_message',
  triggerKind: 'list_message',
  messagesList: 'list',
  licensee: licenseeFactory.build(),
  order: 1,
}))

const triggerText = Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Send text',
  expression: 'send_text',
  triggerKind: 'text',
  text: 'texto',
  licensee: licenseeFactory.build(),
  order: 1,
}))

export { triggerFactory, triggerSingleProduct, triggerReplyButton, triggerListMessage, triggerText }
