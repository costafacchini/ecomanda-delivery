const resetCarts = require('../services/ResetCarts')

module.exports = {
  key: 'reset-carts',
  async handle(data) {
    return await resetCarts(data.body)
  },
}
