import { ContactRepositoryMemory } from '@repositories/contact'
import { CartRepositoryMemory } from '@repositories/cart'
import { AddCartItem } from './AddCartItem.js'
import { CART_NOT_FOUND } from './cartErrors.js'

function buildUseCase() {
  const contactRepository = new ContactRepositoryMemory()
  const cartRepository = new CartRepositoryMemory()
  const addCartItem = new AddCartItem({ contactRepository, cartRepository })
  return { addCartItem, contactRepository, cartRepository }
}

describe('AddCartItem', () => {
  it('adds a new product to the cart', async () => {
    const { addCartItem, contactRepository, cartRepository } = buildUseCase()

    const contact = await contactRepository.create({
      number: '5511990283745',
      licensee: 'licensee-id',
      type: '@c.us',
    })
    await cartRepository.create({ contact: contact._id, licensee: 'licensee-id', concluded: false })

    const result = await addCartItem.execute({
      contactNumber: '5511990283745',
      licenseeId: 'licensee-id',
      products: [{ product_retailer_id: 'p1', quantity: 1, name: 'Item A', price: 10, additionals: [] }],
    })

    expect(result.products).toHaveLength(1)
    expect(result.products[0].product_retailer_id).toBe('p1')
  })

  it('increments quantity for a product already in the cart matched by product_retailer_id', async () => {
    const { addCartItem, contactRepository, cartRepository } = buildUseCase()

    const contact = await contactRepository.create({
      number: '5511990283745',
      licensee: 'licensee-id',
      type: '@c.us',
    })
    await cartRepository.create({
      contact: contact._id,
      licensee: 'licensee-id',
      concluded: false,
      products: [{ product_retailer_id: 'p1', quantity: 2, name: 'Item A', price: 10, additionals: [] }],
    })

    const result = await addCartItem.execute({
      contactNumber: '5511990283745',
      licenseeId: 'licensee-id',
      products: [{ product_retailer_id: 'p1', quantity: 3, name: 'Item A', price: 10, additionals: [] }],
    })

    expect(result.products).toHaveLength(1)
    expect(result.products[0].quantity).toBe(5)
  })

  it('returns null when contact is not found', async () => {
    const { addCartItem } = buildUseCase()

    const result = await addCartItem.execute({
      contactNumber: '5511111111111',
      licenseeId: 'licensee-id',
      products: [],
    })

    expect(result).toBeNull()
  })

  it('returns CART_NOT_FOUND when contact exists but has no open cart', async () => {
    const { addCartItem, contactRepository } = buildUseCase()

    await contactRepository.create({ number: '5511990283745', licensee: 'licensee-id', type: '@c.us' })

    const result = await addCartItem.execute({
      contactNumber: '5511990283745',
      licenseeId: 'licensee-id',
      products: [],
    })

    expect(result).toBe(CART_NOT_FOUND)
  })
})
