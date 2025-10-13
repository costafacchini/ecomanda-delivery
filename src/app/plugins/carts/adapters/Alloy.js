class Alloy {
  parseCart(licensee, contact, cart) {
    const { itens } = cart

    const cartParsed = {
      delivery_tax: 0,
      products: [],
      contact: contact._id,
      licensee: licensee._id,
      concluded: false,
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
      discount: 0,
      latitude: '',
      longitude: '',
      location: '',
      documento: '',
      delivery_method: '',
    }

    for (const item of itens) {
      const productParsed = {
        product_retailer_id: item.id_alloy,
        name: item.nome,
        quantity: item.quantidade,
        unit_price: item.valor,
        note: '',
        product_fb_id: '',
        additionals: [],
      }

      if (item.complementos) {
        for (const additional of item.complementos) {
          const additionalParsed = {
            name: additional.nome,
            quantity: additional.quantidade,
            unit_price: additional.valor,
            product_retailer_id: additional.id_alloy,
          }

          productParsed.additionals.push(additionalParsed)
        }
      }

      cartParsed.products.push(productParsed)
    }

    return cartParsed
  }
}

export { Alloy }
