const Licensee = require('@models/Licensee')
const mongoServer = require('../../../.jest/utils')
const { createProduct, getProductBy } = require('@repositories/product')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('product repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#createProduct', () => {
    it('creates a product', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      const product = await createProduct({
        licensee,
        name: 'Product 1',
      })

      expect(product).toEqual(
        expect.objectContaining({
          name: 'Product 1',
          licensee,
        })
      )
    })
  })

  describe('#getProductBy', () => {
    it('returns one record by filter', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      await createProduct({
        name: 'Product 1',
        licensee,
      })

      const anotherLicensee = await Licensee.create(licenseeFactory.build())
      await createProduct({
        name: 'Product 1',
        licensee: anotherLicensee,
      })

      const product = await getProductBy({ name: 'Product 1', licensee: licensee._id })

      expect(product).toEqual(
        expect.objectContaining({
          name: 'Product 1',
          licensee: licensee._id,
        })
      )

      expect(product).not.toEqual(
        expect.objectContaining({
          name: 'Product 1',
          licensee: anotherLicensee._id,
        })
      )
    })
  })
})
