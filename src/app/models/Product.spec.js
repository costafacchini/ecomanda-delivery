const Product = require('@models/Product')
const mongoServer = require('../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('Product', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const product = await Product.create({ licensee })

      expect(product._id).not.toEqual(null)
    })

    it('does not changes _id if product is changed', async () => {
      const product = await Product.create({ product_retailer_id: 'acb0134', licensee })

      product.product_retailer_id = 'Changed'
      const alteredProduct = await product.save()

      expect(product._id).toEqual(alteredProduct._id)
      expect(alteredProduct.product_retailer_id).toEqual('Changed')
    })
  })

  describe('validations', () => {
    describe('licensee', () => {
      it('is required', () => {
        const product = new Product({})
        const validation = product.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })
  })
})
