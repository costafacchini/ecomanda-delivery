export type TriggerKind =
  | 'multi_product'
  | 'single_product'
  | 'reply_button'
  | 'list_message'
  | 'text'

export interface ITrigger {
  id: string
  name: string
  triggerKind: TriggerKind
  expression: string
  licensee: string | null
  catalogId: string
  catalogMulti: string
  catalogSingle: string
  textReplyButton: string
  messagesList: string
  text: string
  order: number
}

export interface ITriggerFilters {
  page?: number
  expression?: string
  licensee?: string
  [key: string]: unknown
}

export type ITriggerInput = Omit<ITrigger, 'id'>

export interface ITriggerImportValues {
  [key: string]: unknown
}
