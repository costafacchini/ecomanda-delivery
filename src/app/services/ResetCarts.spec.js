const resetCarts = require('./ResetCarts')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Cart = require('@models/Cart')
const mongoServer = require('.jest/utils')
const { licenseeComplete: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { cart: cartFactory } = require('@factories/cart')
const moment = require('moment')

describe('resetCarts', () => {
  jest.spyOn(global.console, 'info').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('when the cart is open an hour ago', () => {
    it('closes the cart', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      const contact = await Contact.create(contactFactory.build({ licensee }))

      const cartOpenedOnLimitEnding1 = await Cart.create(
        cartFactory.build({
          licensee,
          contact,
          concluded: false,
          createdAt: moment().tz('UTC').subtract(59, 'minutes'),
        })
      )

      const cartExpired1 = await Cart.create(
        cartFactory.build({
          licensee,
          contact,
          concluded: false,
          createdAt: moment().tz('UTC').subtract(1, 'hours'),
        })
      )

      await resetCarts()

      const cartOpenedOnLimitEnding1Reloaded = await Cart.findById(cartOpenedOnLimitEnding1)
      expect(cartOpenedOnLimitEnding1Reloaded.concluded).toEqual(false)

      const cartExpired1Reloaded = await Cart.findById(cartExpired1)
      expect(cartExpired1Reloaded.concluded).toEqual(true)
    })
  })
})
