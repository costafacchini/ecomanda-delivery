import { ContactRepositoryMemory } from '@repositories/contact'
import { CartRepositoryMemory } from '@repositories/cart'
import { NormalizePhone } from '../../helpers/NormalizePhone'
import { CreateCart } from './CreateCart.js'

function buildParsedCart(overrides = {}) {
  return {
    delivery_tax: 0,
    products: [],
    concluded: false,
    catalog: null,
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    cep: '',
    uf: '',
    note: '',
    change: 0,
    partner_key: '',
    payment_method: '',
    points: 0,
    discount: 0,
    latitude: null,
    longitude: null,
    location: null,
    documento: '',
    delivery_method: '',
    ...overrides,
  }
}

function buildUseCase() {
  const contactRepository = new ContactRepositoryMemory()
  const cartRepository = new CartRepositoryMemory()
  const createCartAdapterInstance = { parseCart: jest.fn() }
  const createCartAdapter = jest.fn().mockReturnValue(createCartAdapterInstance)
  const createNormalizePhone = (number) => new NormalizePhone(number)

  const createCart = new CreateCart({
    contactRepository,
    cartRepository,
    createNormalizePhone,
    createCartAdapter,
  })

  return { createCart, contactRepository, cartRepository, createCartAdapter, createCartAdapterInstance }
}

describe('CreateCart', () => {
  it('creates contact if not found, creates new cart, returns cart with status fields', async () => {
    const { createCart, cartRepository, createCartAdapterInstance } = buildUseCase()

    createCartAdapterInstance.parseCart.mockReturnValue(buildParsedCart({ delivery_tax: 1.5 }))

    const licensee = { _id: 'licensee-id', useChatbot: false }
    const result = await createCart.execute({
      contact: '5511990283745',
      name: 'John',
      licensee,
      origin: 'plugin-x',
      body: {},
    })

    expect(result).toBeDefined()
    expect(result.licensee).toBe('licensee-id')
    expect(result.delivery_tax).toBe(1.5)

    const carts = await cartRepository.find({})
    expect(carts).toHaveLength(1)
  })

  it('uses existing contact when getContactByNumber finds it', async () => {
    const { createCart, contactRepository, cartRepository, createCartAdapterInstance } = buildUseCase()

    const contact = await contactRepository.create({
      number: '5511990283745',
      licensee: 'licensee-id',
      type: '@c.us',
    })
    createCartAdapterInstance.parseCart.mockReturnValue(buildParsedCart())

    const licensee = { _id: 'licensee-id', useChatbot: false }
    const result = await createCart.execute({
      contact: '5511990283745',
      licensee,
      origin: 'plugin-x',
      body: {},
    })

    expect(result).toBeDefined()
    expect(result.contact).toBe(contact._id)

    const contacts = await contactRepository.find({})
    expect(contacts).toHaveLength(1)
  })

  it('merges products and updates scalar fields when an open cart already exists', async () => {
    const { createCart, contactRepository, cartRepository, createCartAdapterInstance } = buildUseCase()

    const contact = await contactRepository.create({
      number: '5511990283745',
      licensee: 'licensee-id',
      type: '@c.us',
    })
    await cartRepository.create({
      contact: contact._id,
      licensee: 'licensee-id',
      concluded: false,
      products: [{ product_retailer_id: 'p1', quantity: 1, name: 'Item A', price: 10, additionals: [] }],
    })

    createCartAdapterInstance.parseCart.mockReturnValue(
      buildParsedCart({
        products: [{ product_retailer_id: 'p2', quantity: 2, name: 'Item B', price: 5, additionals: [] }],
        note: 'updated note',
      }),
    )

    const licensee = { _id: 'licensee-id', useChatbot: false }
    const result = await createCart.execute({
      contact: '5511990283745',
      licensee,
      origin: 'plugin-x',
      body: {},
    })

    expect(result.products).toHaveLength(2)
    expect(result.note).toBe('updated note')

    const carts = await cartRepository.find({})
    expect(carts).toHaveLength(1)
  })

  it('falls back to contact number as name when name is absent and contact is not found', async () => {
    const { createCart, contactRepository, createCartAdapterInstance } = buildUseCase()

    createCartAdapterInstance.parseCart.mockReturnValue(buildParsedCart())

    const licensee = { _id: 'licensee-id', useChatbot: false }
    await createCart.execute({
      contact: '5511990283745',
      licensee,
      origin: 'plugin-x',
      body: {},
    })

    const contacts = await contactRepository.find({})
    expect(contacts[0].name).toBe('5511990283745')
  })
})
