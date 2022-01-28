const Cart = require('@models/Cart')

async function parseText(text, contact) {
  return text
    .replace(/\$contact_name/g, contact.name)
    .replace(/\$contact_number/g, contact.number)
    .replace(/\$contact_address_complete/g, parseAddressComplete(contact))
    .replace(/\$last_cart_resume/g, await parseLastCart(contact))
}

function parseAddressComplete(contact) {
  const address_complete = []
  address_complete.push(`${contact.address}, ${contact.address_number}`)
  address_complete.push(`${contact.address_complement}`)
  address_complete.push(`${contact.neighborhood}`)
  address_complete.push(`CEP ${contact.cep}`)
  address_complete.push(`${contact.city} - ${contact.uf}`)

  return address_complete.join('\n')
}

async function parseLastCart(contact) {
  const last_cart = await Cart.findOne({ contact: contact._id, concluded: false })
  return last_cart ? cartDescription(last_cart) : ''
}

function cartDescription(cart) {
  const description = []

  if (cart.products.length > 0) {
    productsDescription(cart.products, description)
  }
  description.push(`Taxa Entrega: ${formatNumber(cart.delivery_tax)}`)
  description.push(`Total: ${formatNumber(cart.total)}`)
  description.push(`Concluído: ${concludedDescription(cart.concluded)}`)

  if (cart.address) {
    description.push(`Entrega: ${cart.address}, ${cart.address_number} - ${cart.address_complement}`)
    description.push(`         ${cart.neighborhood} - ${cart.city}/${cart.uf} - ${cart.cep}`)
  }

  if (cart.note) {
    description.push(`Obs: ${cart.note}`)
  }

  return description.join('\n')
}

function productsDescription(products, description) {
  return products.map((item) =>
    description.push(`${item.quantity} - ${item.product_retailer_id} - ${formatNumber(item.unit_price)}`)
  )
}

function concludedDescription(concluded) {
  return concluded ? 'Sim' : 'Não'
}

function formatNumber(value, decimal = 2) {
  return '$' + value.toFixed(decimal).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

module.exports = parseText
