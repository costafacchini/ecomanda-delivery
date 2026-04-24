import Repository, { RepositoryMemory } from './repository.js'
import Product from '../models/Product.js'

class ProductRepositoryDatabase extends Repository {
  model() {
    return Product
  }
}

class ProductRepositoryMemory extends RepositoryMemory {}

async function createProduct(fields) {
  const productRepository = new ProductRepositoryDatabase()
  return await productRepository.create(fields)
}

async function getProductBy(filter) {
  const productRepository = new ProductRepositoryDatabase()
  return await productRepository.findFirst(filter)
}

export { ProductRepositoryDatabase, ProductRepositoryMemory, createProduct, getProductBy }
