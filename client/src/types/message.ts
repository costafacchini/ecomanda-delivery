import type { IContact } from './contact'

export interface IMessageTrigger {
  _id: string
  name: string
}

export interface IMessageSector {
  _id: string
  name: string
}

export interface ICartProduct {
  quantity: number
  unit_price: number
  product_retailer_id: string
}

export interface ICart {
  products: ICartProduct[]
  delivery_tax: number
  total: number
  concluded: boolean
  address?: string
  address_number?: string
  address_complement?: string
  neighborhood?: string
  city?: string
  uf?: string
  cep?: string
  note?: string
}

export interface IMessage {
  id: string
  contact?: Pick<IContact, '_id' | 'name'>
  kind?: string
  text?: string
  destination?: string
  sended?: boolean
  error?: string | null
  url?: string
  fileName?: string
  latitude?: string
  longitude?: string
  trigger?: IMessageTrigger
  sector?: IMessageSector | null
  cart?: ICart
  createdAt?: string
}

export interface IMessageFilters {
  startDate?: string
  endDate?: string
  licensee?: string
  onlyErrors?: boolean
  sended?: boolean
  contact?: string
  kind?: string
  destination?: string
  page?: number
}
