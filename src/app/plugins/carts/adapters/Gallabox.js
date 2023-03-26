class Gallabox {
  parseCart(licensee, contact, cart) {
    const ecomandaKeys = {
      _product_retailer_id: 'product_retailer_id',
      _item_price: 'unit_price',
      _quantity: 'quantity',
      _fbproductid: 'product_fb_id',
      _name: 'name',
      _description: 'note',
    }

    const cartParsed = {
      delivery_tax: 0,
      discount: 0,
      contact: contact._id,
      licensee: licensee._id,
      concluded: false,
      catalog: '',
      address: contact.address,
      address_number: contact.address_number,
      address_complement: contact.address_complement,
      neighborhood: contact.neighborhood,
      city: contact.city,
      cep: contact.cep,
      uf: contact.uf,
      note: '',
      change: 0,
      partner_key: '',
      payment_method: '',
      points: false,
      products: [],
    }

    for (const property in cart) {
      const index = property.replace(/[^0-9]/g, '')
      const key = property.replace(/ /g, '_').replace(/[0-9]/g, '').toLowerCase()
      const value = cart[property]

      if (!ecomandaKeys[key]) continue
      if (!cartParsed.products[index]) cartParsed.products[index] = {}

      cartParsed.products[index][ecomandaKeys[key]] = value
    }

    return cartParsed
  }
}

module.exports = Gallabox
