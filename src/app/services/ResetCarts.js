import moment from 'moment-timezone'
import { CartRepositoryDatabase } from '../repositories/cart.js'

async function resetCarts({ cartRepository = new CartRepositoryDatabase() } = {}) {
  const timeLimit = moment().tz('UTC').subtract(1, 'hour')
  await cartRepository.updateMany({ concluded: false, createdAt: { $lte: timeLimit } }, { concluded: true })
  return
}

export { resetCarts }
