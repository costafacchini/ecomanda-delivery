class Default {
  parseCart(licensee, contact, cart) {
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
      name,
    } = cart

    const cartParsed = {
      delivery_tax,
      products,
      contact: contact._id,
      licensee: licensee._id,
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
      name,
    }

    return cartParsed
  }
}

module.exports = Default
