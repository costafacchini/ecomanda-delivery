import { resetCarts } from './ResetCarts.js'
import mongoServer from '.jest/utils'
import { licenseeComplete as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { cart as cartFactory } from '@factories/cart'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { CartRepositoryDatabase } from '@repositories/cart'
import moment from 'moment-timezone'

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
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const cartRepository = new CartRepositoryDatabase()
      const cartOpenedOnLimitEnding1 = await cartRepository.create(
        cartFactory.build({
          licensee,
          contact,
          concluded: false,
          createdAt: moment().tz('UTC').subtract(59, 'minutes'),
        }),
      )

      const cartExpired1 = await cartRepository.create(
        cartFactory.build({
          licensee,
          contact,
          concluded: false,
          createdAt: moment().tz('UTC').subtract(1, 'hours'),
        }),
      )

      await resetCarts()

      const cartOpenedOnLimitEnding1Reloaded = await cartRepository.findFirst({ _id: cartOpenedOnLimitEnding1 })
      expect(cartOpenedOnLimitEnding1Reloaded.concluded).toEqual(false)

      const cartExpired1Reloaded = await cartRepository.findFirst({ _id: cartExpired1 })
      expect(cartExpired1Reloaded.concluded).toEqual(true)
    })
  })
})
