import Product from '@models/Product.js'

async function createProduct(fields) {
  const product = new Product({
    ...fields,
  })

  return await product.save()
}

async function getProductBy(filter) {
  return await Product.findOne(filter)
}

export default { createProduct, getProductBy }
