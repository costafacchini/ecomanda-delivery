export interface ICartProduct {
  product_retailer_id: string
  quantity: number
  unit_price: number
  [key: string]: unknown
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
