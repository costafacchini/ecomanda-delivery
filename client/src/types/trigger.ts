export type TriggerKind = 'multi_product' | 'single_product' | 'reply_button' | 'list_message' | 'text'

export interface ITrigger {
  id: string
  _id: string
  name: string
  triggerKind: TriggerKind
  expression: string
  order: number
  catalogMulti?: string
  catalogSingle?: string
  textReplyButton?: string
  messagesList?: string
  catalogId?: string
  text?: string
  licensee?: string
}

export interface ITriggerFilters {
  page?: number
  expression?: string
  licensee?: string
  [key: string]: unknown
}

export type ITriggerInput = Omit<ITrigger, 'id' | '_id'>

export interface ITriggerImportValues {
  [key: string]: unknown
}
