const Cart = require('@models/Cart')
const moment = require('moment-timezone')

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
    .populate('contact')
    .populate('products.product')
  return last_cart ? cartDescription(last_cart) : ''
}

function cartDescription(cart) {
  const description = []

  description.push(`Data: ${moment.tz(cart.createdAt, 'America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}`)
  description.push(` `)
  description.push(`Cliente: ${cart.contact.name}`)
  description.push(`Telefone: ${cart.contact.number}`)
  if (cart.address) {
    description.push(`Entrega: ${cart.address}, ${cart.address_number} - ${cart.address_complement}`)
    description.push(`         ${cart.neighborhood} - ${cart.city}/${cart.uf} - ${cart.cep}`)
  }
  description.push(`______________`)
  description.push(` `)
  description.push(`PEDIDO`)
  description.push(`QTD		PRODUTO`)
  description.push(`______________`)

  if (cart.products.length > 0) {
    description.push(` `)
    productsDescription(cart.products, description)
    description.push(`______________`)
  }
  description.push(`Subtotal: ${formatNumber(cart.total - cart.delivery_tax)}`)
  description.push(`Taxa Entrega: ${formatNumber(cart.delivery_tax)}`)
  description.push(`Total: ${formatNumber(cart.total)}`)

  if (cart.note) {
    description.push(`Obs: ${cart.note}`)
  }

  return description.join('\n')
}

function productsDescription(products, description) {
  return products.map((item) => {
    const productName = item.name || item.product?.name
    description.push(`${item.quantity} - ${productName} - ${formatNumber(item.unit_price)}`)
  })
}

function formatNumber(value, decimal = 2) {
  return '$' + value.toFixed(decimal).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

module.exports = parseText
