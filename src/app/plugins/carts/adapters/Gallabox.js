import { FractionalProducts } from '../../../helpers/FractionalProducts.js'

class Gallabox {
  parseCart(licensee, contact, cart) {
    const cartParsed = {
      delivery_tax: 0,
      discount: 0,
      contact: contact._id,
      licensee: licensee._id,
      concluded: false,
      catalog: cart.order.catalog_id,
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

    for (const item of cart.order.product_items) {
      const productParsed = {
        product_retailer_id: item.product_retailer_id,
        name: '',
        quantity: item.quantity,
        unit_price: item.item_price,
        note: '',
        product_fb_id: '',
      }

      cartParsed.products.push(productParsed)
    }

    for (const product of cart.order.products) {
      const productParsed = cartParsed.products.find((element) => element.product_retailer_id == product.retailer_id)
      productParsed.name = product.name
      productParsed.note = product.description
      productParsed.product_fb_id = product.fbProductId
    }

    const fractionalProducts = new FractionalProducts(licensee)
    cartParsed.products = fractionalProducts.join(cartParsed.products)

    return cartParsed
  }
}

export { Gallabox }
