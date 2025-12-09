import { resetCarts } from '../services/ResetCarts.js'

export default {
  key: 'reset-carts',
  workerEnabled: true,
  async handle(data) {
    return await resetCarts(data.body)
  },
}
