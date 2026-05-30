import Repository, { RepositoryMemory } from './repository.js'
import Product from '../models/Product.js'
import { requireDependency } from '../helpers/RequireDependency'

class ProductRepositoryDatabase extends Repository {
  model() {
    return Product
  }
}

class ProductRepositoryMemory extends RepositoryMemory {}

async function createProduct(fields, { productRepository } = {}) {
  return await requireDependency(productRepository, 'productRepository', 'createProduct').create(fields)
}

async function getProductBy(filter, { productRepository } = {}) {
  return await requireDependency(productRepository, 'productRepository', 'getProductBy').findFirst(filter)
}

export { ProductRepositoryDatabase, ProductRepositoryMemory, createProduct, getProductBy }
