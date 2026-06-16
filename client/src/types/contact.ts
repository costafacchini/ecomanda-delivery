export interface IContact {
  id: string
  _id: string
  name: string
  number: string
  email: string
  type: string
  talkingWithChatBot: boolean
  licensee: string
  waId: string
  landbotId: string
  address: string
  address_number: string
  address_complement: string
  neighborhood: string
  city: string
  cep: string
  ud: string
  delivery_tax: number
  plugin_cart_id: string
}

export interface IContactFilters {
  page?: number
  expression?: string
  licensee?: string
  [key: string]: unknown
}

export type IContactInput = Omit<IContact, 'id' | '_id'>
