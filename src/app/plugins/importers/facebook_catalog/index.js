const Trigger = require('@models/Trigger')
const _ = require('lodash')

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
  constructor(triggerId) {
    this.triggerId = triggerId
  }

  async importCatalog(data) {
    const trigger = await Trigger.findById(this.triggerId)
    const products = []

    const lines = data.split('\n')
    const columns = lines[0].split('\t')

    const indexOfId = columns.indexOf('id')
    const indexOfSection = columns.indexOf('section')

    delete lines[0]
    lines.forEach((line) => {
      const values = line.split('\t')
      products.push({
        id: values[indexOfId],
        section: values[indexOfSection],
      })
    })

    const sections = _.uniqBy(products, 'section').map((product) => product.section)

    trigger.catalogMulti = generateCatalog(trigger.catalogId, sections, products)
    await trigger.save()
  }
}

module.exports = FacebookCatalogImporter
