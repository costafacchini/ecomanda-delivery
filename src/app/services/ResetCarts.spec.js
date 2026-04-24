import { resetCarts } from './ResetCarts.js'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
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
    installMemoryRepositories()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    resetMemoryRepositories()
  })

  it('updates expired open carts through the cart repository', async () => {
    const cartRepository = {
      updateMany: jest.fn().mockResolvedValue({ acknowledged: true }),
    }

    await resetCarts({ cartRepository })

    expect(cartRepository.updateMany).toHaveBeenCalledTimes(1)

    const [filters, fields] = cartRepository.updateMany.mock.calls[0]

    expect(filters.concluded).toEqual(false)
    expect(moment.isMoment(filters.createdAt.$lte)).toEqual(true)
    expect(fields).toEqual({ concluded: true })
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
