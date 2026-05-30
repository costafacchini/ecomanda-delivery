import { CART_NOT_FOUND } from './cartErrors'

class AddCartItem {
  contactRepository: any
  cartRepository: any

  constructor({ contactRepository, cartRepository }: Record<string, any> = {}) {
    this.contactRepository = contactRepository
    this.cartRepository = cartRepository
  }

  async execute({ contactNumber, licenseeId, products }: Record<string, any> = {}) {
    const contact = await this.contactRepository.getContactByNumber(contactNumber, licenseeId)
    if (!contact) return null

    const cart = await this.cartRepository.findFirst({ contact: contact._id, concluded: false })
    if (!cart) return CART_NOT_FOUND

    products?.forEach((product) => {
      const existing = cart.products.find((i) => i.product_retailer_id == product.product_retailer_id)
      if (existing) {
        existing.quantity += product.quantity
      } else {
        cart.products.push(product)
      }
    })

    await this.cartRepository.save(cart)

    return cart
  }
}

export { AddCartItem }
