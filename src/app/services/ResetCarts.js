import Cart from '../models/Cart.js'
import moment from 'moment-timezone'

async function resetCarts() {
  const timeLimit = moment().tz('UTC').subtract(1, 'hour')
  await Cart.updateMany({ concluded: false, createdAt: { $lte: timeLimit } }, { concluded: true })
  return
}

export { resetCarts }
