const Cart = require('@models/Cart')

async function createCart(fields) {
  const cart = new Cart({
    ...fields,
  })

  return await cart.save()
}

async function getCartBy(filter) {
  return await Cart.findOne(filter)
}

module.exports = { createCart, getCartBy }
