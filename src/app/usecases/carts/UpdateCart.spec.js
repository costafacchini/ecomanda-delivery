import { ContactRepositoryMemory } from '@repositories/contact'
import { CartRepositoryMemory } from '@repositories/cart'
import { UpdateCart } from './UpdateCart.js'
import { CART_NOT_FOUND } from './cartErrors.js'

function buildUseCase() {
  const contactRepository = new ContactRepositoryMemory()
  const cartRepository = new CartRepositoryMemory()
  const updateCart = new UpdateCart({ contactRepository, cartRepository })
  return { updateCart, contactRepository, cartRepository }
}

describe('UpdateCart', () => {
  it('updates cart fields and returns the updated cart', async () => {
    const { updateCart, contactRepository, cartRepository } = buildUseCase()

    const contact = await contactRepository.create({
      number: '5511990283745',
      licensee: 'licensee-id',
      type: '@c.us',
    })
    await cartRepository.create({ contact: contact._id, licensee: 'licensee-id', concluded: false })

    const result = await updateCart.execute({
      contactNumber: '5511990283745',
      licenseeId: 'licensee-id',
      fields: { note: 'sem cebola', delivery_tax: 3.5 },
    })

    expect(result.note).toBe('sem cebola')
    expect(result.delivery_tax).toBe(3.5)
  })

  it('merges products array when products field is passed', async () => {
    const { updateCart, contactRepository, cartRepository } = buildUseCase()

    const contact = await contactRepository.create({
      number: '5511990283745',
      licensee: 'licensee-id',
      type: '@c.us',
    })
    await cartRepository.create({
      contact: contact._id,
      licensee: 'licensee-id',
      concluded: false,
      products: [{ product_retailer_id: 'p1', quantity: 1, name: 'A', price: 10, additionals: [] }],
    })

    const result = await updateCart.execute({
      contactNumber: '5511990283745',
      licenseeId: 'licensee-id',
      fields: {
        products: [{ product_retailer_id: 'p2', quantity: 2, name: 'B', price: 5, additionals: [] }],
      },
    })

    expect(result.products).toHaveLength(2)
    expect(result.products[1].product_retailer_id).toBe('p2')
  })

  it('returns null when contact is not found', async () => {
    const { updateCart } = buildUseCase()

    const result = await updateCart.execute({
      contactNumber: '5511111111111',
      licenseeId: 'licensee-id',
      fields: { note: 'test' },
    })

    expect(result).toBeNull()
  })

  it('returns CART_NOT_FOUND when contact exists but has no open cart', async () => {
    const { updateCart, contactRepository } = buildUseCase()

    await contactRepository.create({ number: '5511990283745', licensee: 'licensee-id', type: '@c.us' })

    const result = await updateCart.execute({
      contactNumber: '5511990283745',
      licenseeId: 'licensee-id',
      fields: { note: 'test' },
    })

    expect(result).toBe(CART_NOT_FOUND)
  })
})
