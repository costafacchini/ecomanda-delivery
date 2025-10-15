import { Factory } from 'fishery'
import { licensee } from './licensee'

const triggerMultiProduct = Factory.define(() => ({
  name: 'Send multi products',
  expression: 'send_multi_product',
  triggerKind: 'multi_product',
  catalogMulti: 'catalog',
  catalogId: 'id',
  licensee: licensee.build(),
  order: 1,
}))

const triggerSingleProduct = Factory.define(() => ({
  name: 'Send single product',
  expression: 'send_single_product',
  triggerKind: 'single_product',
  catalogSingle: 'product',
  licensee: licensee.build(),
  order: 1,
}))

const triggerReplyButton = Factory.define(() => ({
  name: 'Send reply buttons',
  expression: 'send_reply_buttons',
  triggerKind: 'reply_button',
  textReplyButton: 'buttons',
  licensee: licensee.build(),
  order: 1,
}))

const triggerListMessage = Factory.define(() => ({
  name: 'Send list message',
  expression: 'send_list_message',
  triggerKind: 'list_message',
  messagesList: 'list',
  licensee: licensee.build(),
  order: 1,
}))

const triggerText = Factory.define(() => ({
  name: 'Send text',
  expression: 'send_text',
  triggerKind: 'text',
  text: 'texto',
  licensee: licensee.build(),
  order: 1,
}))

export { triggerMultiProduct, triggerSingleProduct, triggerReplyButton, triggerListMessage, triggerText }
