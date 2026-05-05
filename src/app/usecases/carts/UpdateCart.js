import { CART_NOT_FOUND } from './cartErrors.js'

const PERMITTED_CART_FIELDS = [
  'delivery_tax',
  'products',
  'concluded',
  'catalog',
  'address',
  'address_number',
  'address_complement',
  'neighborhood',
  'city',
  'cep',
  'uf',
  'note',
  'change',
  'partner_key',
  'payment_method',
  'points',
  'discount',
  'latitude',
  'longitude',
  'location',
  'documento',
  'delivery_method',
]

function pickCartFields(fields = {}) {
  return PERMITTED_CART_FIELDS.reduce((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }
    return payload
  }, {})
}

class UpdateCart {
  constructor({ contactRepository, cartRepository } = {}) {
    this.contactRepository = contactRepository
    this.cartRepository = cartRepository
  }

  async execute({ contactNumber, licenseeId, fields } = {}) {
    const contact = await this.contactRepository.getContactByNumber(contactNumber, licenseeId)
    if (!contact) return null

    const cart = await this.cartRepository.findFirst({ contact: contact._id, concluded: false })
    if (!cart) return CART_NOT_FOUND

    const permitted = pickCartFields(fields)
    delete permitted.licensee
    delete permitted.contact

    Object.keys(permitted).forEach((field) => {
      if (Array.isArray(permitted[field])) {
        permitted[field].forEach((item) => {
          cart[field].push(item)
        })
      } else {
        cart[field] = permitted[field]
      }
    })

    cart.total = cart.calculateTotal()

    await this.cartRepository.update(cart._id, { ...cart })

    return cart
  }
}

export { UpdateCart }
