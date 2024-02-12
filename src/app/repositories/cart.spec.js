const Contact = require('@models/Contact')
const mongoServer = require('../../../.jest/utils')
const { createCart, getCartBy } = require('@repositories/cart')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('cart repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#createCart', () => {
    it('creates a cart', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee }))

      const cart = await createCart({
        licensee,
        contact,
      })

      expect(cart).toEqual(
        expect.objectContaining({
          contact,
          licensee,
        }),
      )
    })
  })

  describe('#getCartBy', () => {
    it('returns one record by filter', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee }))

      await createCart({
        contact,
        licensee,
      })

      const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
      await createCart({
        contact,
        licensee: anotherLicensee,
      })

      const cart = await getCartBy({ contact, licensee })

      expect(cart).toEqual(
        expect.objectContaining({
          contact: contact._id,
          licensee: licensee._id,
        }),
      )

      expect(cart).not.toEqual(
        expect.objectContaining({
          contact: contact._id,
          licensee: anotherLicensee._id,
        }),
      )
    })
  })
})
