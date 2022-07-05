const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const mongoServer = require('../../../.jest/utils')
const { createCart, getCartBy } = require('@repositories/cart')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')

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
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee }))

      const cart = await createCart({
        licensee,
        contact,
      })

      expect(cart).toEqual(
        expect.objectContaining({
          contact,
          licensee,
        })
      )
    })
  })

  describe('#getCartBy', () => {
    it('returns one record by filter', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee }))

      await createCart({
        contact,
        licensee,
      })

      const anotherLicensee = await Licensee.create(licenseeFactory.build())
      await createCart({
        contact,
        licensee: anotherLicensee,
      })

      const cart = await getCartBy({ number: '5511990283745', licensee: licensee._id })

      expect(cart).toEqual(
        expect.objectContaining({
          contact: contact._id,
          licensee: licensee._id,
        })
      )

      expect(contact).not.toEqual(
        expect.objectContaining({
          contact: contact._id,
          licensee: anotherLicensee._id,
        })
      )
    })
  })
})
