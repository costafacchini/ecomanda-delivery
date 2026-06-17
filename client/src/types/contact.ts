export interface IContact {
  _id: string
  id?: string
  name: string
  number?: string
  email?: string
  type?: string
  talkingWithChatBot?: boolean
  licensee?: string | IContactLicensee
  waId?: string
  landbotId?: string
  address?: string
  address_number?: string
  address_complement?: string
  neighborhood?: string
  city?: string
  cep?: string
  uf?: string
  delivery_tax?: number
  plugin_cart_id?: string
  isGroup?: boolean
  active?: boolean
}

export interface IContactLicensee {
  _id: string
  name?: string
}

export interface IContactFilters {
  page?: number
  expression?: string
  licensee?: string
  isGroup?: boolean
  active?: boolean
}
