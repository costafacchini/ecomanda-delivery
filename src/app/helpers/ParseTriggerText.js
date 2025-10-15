import moment from 'moment-timezone'
import { CartRepositoryDatabase } from '../repositories/cart.js'

async function parseText(text, contact) {
  return text
    .replace(/\$contact_name/g, contact.name)
    .replace(/\$contact_number/g, contact.number)
    .replace(/\$contact_address_complete/g, parseAddressComplete(contact))
    .replace(/\$last_cart_resume/g, await parseLastCart(contact))
}

function parseAddressComplete(contact) {
  const address_complete = []
  address_complete.push(`${contact.address || ''}, ${contact.address_number || ''}`)
  address_complete.push(`${contact.address_complement || ''}`)
  address_complete.push(`${contact.neighborhood || ''}`)
  address_complete.push(`CEP ${contact.cep || ''}`)
  address_complete.push(`${contact.city || ''} - ${contact.uf || ''}`)

  return address_complete.join('\n')
}

async function parseLastCart(contact) {
  const cartRepository = new CartRepositoryDatabase()
  const last_cart = await cartRepository.findFirst({ contact: contact._id, concluded: false }, [
    'contact',
    'licensee',
    'products.product',
  ])
  return last_cart ? cartDescription(last_cart) : ''
}

function cartDescription(cart) {
  const description = []
  const title = cart.partner_key
    ? `*${cart.licensee.name.toUpperCase()} - PEDIDO ${cart.partner_key}*`
    : `*${cart.licensee.name.toUpperCase()}*`

  description.push(title)
  description.push(`Data: ${moment.tz(cart.createdAt, 'America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}`)
  description.push(` `)
  description.push(`*Cliente:* ${cart.contact.name}`)
  description.push(`*Telefone:* ${phoneWithoutCountryCode(cart.contact.number)}`)
  if (cart.address) {
    const line1 = `*Entrega:* ${cart.address}, ${cart.address_number} - ${cart.address_complement}`
    description.push(line1.replace(/null/g, ''))

    const line2 = `         ${cart.neighborhood} - ${cart.city}/${cart.uf} - ${cart.cep}`
    description.push(line2.replace(/null/g, ''))
  }
  description.push(`______________`)
  description.push(` `)
  description.push(`*ITENS DO PEDIDO*`)
  description.push(` `)

  if (cart.products.length > 0) {
    description.push(` `)
    productsDescription(cart.products, description)
    description.push(`______________`)
    description.push(` `)
  }
  description.push(`Subtotal: ${formatNumber(cart.total - cart.delivery_tax)}`)
  description.push(`Taxa Entrega: ${formatNumber(cart.delivery_tax)}`)
  description.push(`Desconto: ${formatNumber(cart.discount)}`)
  description.push(`*TOTAL:* ${formatNumber(cart.total)}`)
  description.push(` `)
  if (cart.payment_method) {
    description.push(`*FORMA DE PAGAMENTO*`)
    description.push(`${cart.payment_method}`)
    description.push(` `)
  }

  const cardPayment =
    cart.payment_method && 'pix,crédito,credito,visa,master,mastercard,elo'.includes(cart.payment_method)

  if (!cardPayment) description.push(`*TROCO PARA:* ${formatNumber(cart.change)}`)

  if (cart.note) {
    description.push(`______________`)
    description.push(`*OBSERVACOES*`)
    description.push(`${cart.note}`)
  }

  if (cart.points) {
    description.push(`Pontos Ganhos Fidelidade: ${parseInt(cart.total - cart.delivery_tax)}`)
  }

  return description.join('\n')
}

function productsDescription(products, description) {
  return products.map((item) => {
    const productName = item.name || item.product?.name
    description.push(`${item.quantity}x ${productName} - ${formatNumber(item.unit_price)}`)
    if (item.additionals.length > 0) {
      for (const additional of item.additionals) {
        description.push(`   ${item.quantity}x ${additional.name}`)
      }
    }
    // if (item.note) description.push(`   Obs: ${item.note}`)
  })
}

function formatNumber(value, decimal = 2) {
  return 'R$ ' + value.toFixed(decimal).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function phoneWithoutCountryCode(phone) {
  return phone.length === 13 ? phone.substr(2, 11) : phone
}

async function parseCart(cartId) {
  const cartRepository = new CartRepositoryDatabase()
  const cart = await cartRepository.findFirst({ _id: cartId }, ['contact', 'licensee', 'products.product'])
  return cart ? cartDescription(cart) : ''
}

export { parseText, parseCart }
