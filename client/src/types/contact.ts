export interface IContact {
  id: string
  name: string
  number: string
  email: string
  talkingWithChatBot: boolean
  licensee: string | null
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
  type?: string
}

export interface IContactFilters {
  page?: number
  expression?: string
  licensee?: string
  [key: string]: unknown
}

export type IContactInput = Omit<IContact, 'id'>
