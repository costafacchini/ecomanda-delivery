import _ from 'lodash'
import { TriggerRepositoryDatabase } from '../../../repositories/trigger.js'
import { ProductRepositoryDatabase } from '../../../repositories/product.js'

async function importProducts(products, licensee, productRepository) {
  const importedProductsPromises = await products.map(async (product) => {
    const productExists = await productRepository.findFirst({ product_retailer_id: product.id, licensee })
    if (productExists) return productExists

    return await productRepository.create({ product_retailer_id: product.id, name: product.title, licensee })
  })

  return await Promise.all(importedProductsPromises)
}

function generateCatalog(catalogId, sections, products) {
  return `
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
    "catalog_id": "${catalogId}",
    "sections": ${generateSections(sections, products)}
  }
}`
}

function generateSections(sections, products) {
  return `[${sections.map((section) => generateSection(section, products)).join(',')}]`
}

function generateSection(section, products) {
  const productsOfSection = products.filter((product) => product.section === section)
  return `
      {
        "title": "${section}",
        "product_items": ${generateProductItems(productsOfSection)}
      }`
}

function generateProductItems(products) {
  return `[${products.map((product) => generateProductItem(product.id)).join(',')}]`
}

function generateProductItem(productId) {
  return `
          {
            "product_retailer_id": "${productId}"
          }`
}

class FacebookCatalogImporter {
  constructor(
    triggerId,
    { triggerRepository = new TriggerRepositoryDatabase(), productRepository = new ProductRepositoryDatabase() } = {},
  ) {
    this.triggerId = triggerId
    this.triggerRepository = triggerRepository
    this.productRepository = productRepository
  }

  async importCatalog(data) {
    const trigger = await this.triggerRepository.findFirst({ _id: this.triggerId })
    const products = []

    const lines = data.split('\n')
    const columns = lines[0].split('\t')

    const indexOfId = columns.indexOf('id')
    const indexOfSection = columns.indexOf('section')
    const indexOfTitle = columns.indexOf('title')

    delete lines[0]
    lines.forEach((line) => {
      const values = line.split('\t')
      products.push({
        id: values[indexOfId],
        section: values[indexOfSection],
        title: values[indexOfTitle],
      })
    })

    await importProducts(products, trigger.licensee, this.productRepository)

    const sections = _.uniqBy(products, 'section').map((product) => product.section)

    trigger.catalogMulti = generateCatalog(trigger.catalogId, sections, products)
    await this.triggerRepository.save(trigger)
  }
}

export { FacebookCatalogImporter }
