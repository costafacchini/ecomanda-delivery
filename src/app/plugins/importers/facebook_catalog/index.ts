// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash') as any

async function importProducts(products: any, licensee: any, productRepository: any) {
  const importedProductsPromises = await products.map(async (product: any) => {
    const productExists = await productRepository.findFirst({ product_retailer_id: product.id, licensee })
    if (productExists) return productExists

    return await productRepository.create({ product_retailer_id: product.id, name: product.title, licensee })
  })

  return await Promise.all(importedProductsPromises)
}

function generateCatalog(catalogId: any, sections: any, products: any) {
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

function generateSections(sections: any, products: any) {
  return `[${sections.map((section: any) => generateSection(section, products)).join(',')}]`
}

function generateSection(section: any, products: any) {
  const productsOfSection = products.filter((product: any) => product.section === section)
  return `
      {
        "title": "${section}",
        "product_items": ${generateProductItems(productsOfSection)}
      }`
}

function generateProductItems(products: any) {
  return `[${products.map((product: any) => generateProductItem(product.id)).join(',')}]`
}

function generateProductItem(productId: any) {
  return `
          {
            "product_retailer_id": "${productId}"
          }`
}

class FacebookCatalogImporter {
  triggerId: any
  triggerRepository: any
  productRepository: any

  constructor(triggerId: any, { triggerRepository, productRepository }: { triggerRepository?: any; productRepository?: any } = {}) {
    this.triggerId = triggerId
    this.triggerRepository = triggerRepository
    this.productRepository = productRepository
  }

  async importCatalog(data: any) {
    const trigger = await this.triggerRepository.findFirst({ _id: this.triggerId })
    const products: any[] = []

    const lines = data.split('\n')
    const columns = lines[0].split('\t')

    const indexOfId = columns.indexOf('id')
    const indexOfSection = columns.indexOf('section')
    const indexOfTitle = columns.indexOf('title')

    delete lines[0]
    lines.forEach((line: any) => {
      const values = line.split('\t')
      products.push({
        id: values[indexOfId],
        section: values[indexOfSection],
        title: values[indexOfTitle],
      })
    })

    await importProducts(products, trigger.licensee, this.productRepository)

    const sections = _.uniqBy(products, 'section').map((product: any) => product.section)

    trigger.catalogMulti = generateCatalog(trigger.catalogId, sections, products)
    await this.triggerRepository.save(trigger)
  }
}

export { FacebookCatalogImporter }
