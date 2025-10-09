import mongoServer from '../../../.jest/utils.js'
import { createProduct, getProductBy  } from '@repositories/product.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

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
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const product = await createProduct({
        licensee,
        name: 'Product 1',
      })

      expect(product).toEqual(
        expect.objectContaining({
          name: 'Product 1',
          licensee,
        }),
      )
    })
  })

  describe('#getProductBy', () => {
    it('returns one record by filter', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())
      await createProduct({
        name: 'Product 1',
        licensee,
      })

      const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
      await createProduct({
        name: 'Product 1',
        licensee: anotherLicensee,
      })

      const product = await getProductBy({ name: 'Product 1', licensee: licensee._id })

      expect(product).toEqual(
        expect.objectContaining({
          name: 'Product 1',
          licensee: licensee._id,
        }),
      )

      expect(product).not.toEqual(
        expect.objectContaining({
          name: 'Product 1',
          licensee: anotherLicensee._id,
        }),
      )
    })
  })
})
