class CreateCart {
  contactRepository: any
  cartRepository: any
  createNormalizePhone: any
  createCartAdapter: any

  constructor({ contactRepository, cartRepository, createNormalizePhone, createCartAdapter }: Record<string, any> = {}) {
    this.contactRepository = contactRepository
    this.cartRepository = cartRepository
    this.createNormalizePhone = createNormalizePhone
    this.createCartAdapter = createCartAdapter
  }

  async execute({ contact, name, licensee, origin, body }: Record<string, any> = {}) {
    let cartContact = await this.contactRepository.getContactByNumber(contact, licensee._id)

    if (!cartContact) {
      if (!name) name = contact

      const normalizedPhone = this.createNormalizePhone(contact)

      cartContact = await this.contactRepository.create({
        licensee: licensee._id,
        number: normalizedPhone.number,
        type: normalizedPhone.type,
        name,
        talkingWithChatBot: licensee.useChatbot,
      })
    }

    const cartAdapter = this.createCartAdapter(origin)

    const {
      delivery_tax,
      products,
      concluded,
      catalog,
      address,
      address_number,
      address_complement,
      neighborhood,
      city,
      cep,
      uf,
      note,
      change,
      partner_key,
      payment_method,
      points,
      discount,
      latitude,
      longitude,
      location,
      documento,
      delivery_method,
    } = cartAdapter.parseCart(licensee, contact, body)

    let cart = await this.cartRepository.findFirst({ contact: cartContact._id, concluded: false })

    if (!cart) {
      cart = await this.cartRepository.create({
        delivery_tax,
        contact: cartContact._id,
        licensee: licensee._id,
        products,
        concluded,
        catalog,
        address,
        address_number,
        address_complement,
        neighborhood,
        city,
        cep,
        uf,
        note,
        change,
        partner_key,
        payment_method,
        points,
        discount,
        latitude,
        longitude,
        location,
        documento,
        delivery_method,
      })
    } else {
      cart.delivery_tax = delivery_tax
      cart.catalog = catalog
      cart.address = address
      cart.address_number = address_number
      cart.address_complement = address_complement
      cart.neighborhood = neighborhood
      cart.city = city
      cart.cep = cep
      cart.uf = uf
      cart.note = note
      cart.change = change
      cart.partner_key = partner_key
      cart.payment_method = payment_method
      cart.points = points
      cart.discount = discount
      cart.latitude = latitude
      cart.longitude = longitude
      cart.location = location
      cart.documento = documento
      cart.delivery_method = delivery_method
      Array.prototype.push.apply(cart.products, products)
      cart.total = cart.calculateTotal()

      await this.cartRepository.update(cart._id, { ...cart })
    }

    return cart
  }
}

export { CreateCart }
