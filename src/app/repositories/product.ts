import Repository, { RepositoryMemory } from './repository'
import Product from '../models/Product'
import { requireDependency } from '../helpers/RequireDependency'

class ProductRepositoryDatabase extends Repository {
  model() {
    return Product
  }
}

class ProductRepositoryMemory extends RepositoryMemory {}

async function createProduct(fields, { productRepository }: { productRepository?: any } = {}) {
  return await requireDependency(productRepository, 'productRepository', 'createProduct').create(fields)
}

async function getProductBy(filter, { productRepository }: { productRepository?: any } = {}) {
  return await requireDependency(productRepository, 'productRepository', 'getProductBy').findFirst(filter)
}

export { ProductRepositoryDatabase, ProductRepositoryMemory, createProduct, getProductBy }
