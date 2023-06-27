const Cart = require('@models/Cart')
const moment = require('moment-timezone')

async function resetCarts() {
  const timeLimit = moment().tz('UTC').subtract(1, 'hour')
  await Cart.updateMany({ concluded: false, createdAt: { $lte: timeLimit } }, { concluded: true })
  return
}

module.exports = resetCarts
