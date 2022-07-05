const Product = require('@models/Product')

async function createProduct(fields) {
  const product = new Product({
    ...fields,
  })

  return await product.save()
}

async function getProductBy(filter) {
  return await Product.findOne(filter)
}

module.exports = { createProduct, getProductBy }
