const Trigger = require('@models/Trigger')
const Product = require('@models/Product')
const FacebookCatalogImporter = require('@plugins/importers/facebook_catalog/index')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { triggerMultiProduct: triggerFactory } = require('@factories/trigger')
const { product: productFactory } = require('@factories/product')
const mongoServer = require('../../../../../.jest/utils')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('FacebookCatalogImporter', () => {
  beforeAll(async () => {
    await mongoServer.connect()
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  it('imports csv catalog on whatsapp catalog', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(licenseeFactory.build())

    const trigger = await Trigger.create(triggerFactory.build({ licensee }))
    await Product.create(productFactory.build({ licensee, product_retailer_id: '83863' }))

    const facebookCatalogImporter = new FacebookCatalogImporter(trigger._id)
    await facebookCatalogImporter.importCatalog(
      `id	title	description	section
83863	Double Monster Bacon + Refri	2 Monster Bacon Artesanais + 2 Refri Lata 350ml + Entrega grátis.	Hamburguer
83864	Double Atomic Barbecue + Refri	2 Atomic Barbecue Artesanais + 2 Refri Lata 350ml + Entrega grátis.	Hamburguer
83877	Guaraná Antárctica Lata	Guaraná Antarctica lata de 350ml.	Bebidas`,
    )

    const triggerImported = await Trigger.findById(trigger._id)
    const catalog = `
{
  "type": "product_list",
  "header": {
    "type": "text",
    "text": "Menu"
  },
  "body": {
    "text": "Itens"
  },
  "footer": {
    "text": "Selecione os itens desejados"
  },
  "action": {
    "catalog_id": "id",
    "sections": [
      {
        "title": "Hamburguer",
        "product_items": [
          {
            "product_retailer_id": "83863"
          },
          {
            "product_retailer_id": "83864"
          }]
      },
      {
        "title": "Bebidas",
        "product_items": [
          {
            "product_retailer_id": "83877"
          }]
      }]
  }
}`

    expect(triggerImported.catalogMulti).toBe(catalog)
    expect(await Product.where({ licensee }).countDocuments()).toEqual(3)
  })
})
