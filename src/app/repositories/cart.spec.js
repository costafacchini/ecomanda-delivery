import Cart from '@models/Cart.js'
import mongoServer from '../../../.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { CartRepositoryDatabase  } from '@repositories/cart.js'

describe('cart repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const cartRepository = new CartRepositoryDatabase()

      expect(cartRepository.model()).toEqual(Cart)
    })
  })

  describe('#create', () => {
    it('creates a cart', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create({
        licensee,
        contact,
      })

      expect(cart).toEqual(
        expect.objectContaining({
          contact,
          licensee,
        }),
      )
    })

    describe('when is invalid cart', () => {
      it('generate exception with error', async () => {
        const cartRepository = new CartRepositoryDatabase()

        await expect(async () => {
          await cartRepository.create()
        }).rejects.toThrow(
          'Cart validation failed: licensee: Licensee: Você deve preencher o campo, contact: Contact: Você deve preencher o campo',
        )
      })
    })
  })

  describe('#update', () => {
    it('updates cart', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))
      const cartData = { contact, licensee, delivery_tax: 0 }

      const cartRepository = new CartRepositoryDatabase()
      const cart = await cartRepository.create(cartData)
      cart.delivery_tax = 1

      const status = await cartRepository.update(cart._id, { ...cart })
      expect(status.acknowledged).toEqual(true)
    })

    describe('when is invalid', () => {
      it('generate exception with error', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee }))
        const cartData = { contact, licensee }

        const cartRepository = new CartRepositoryDatabase()
        const cart = await cartRepository.create(cartData)
        cart.contact = null

        await expect(async () => {
          await cartRepository.update(cart._id, { ...cart })
        }).rejects.toThrow('Validation failed: contact: Contact: Você deve preencher o campo')
      })
    })
  })

  describe('#findFirst', () => {
    it('finds a licensee', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))

      const cartRepository = new CartRepositoryDatabase()
      await cartRepository.create({
        contact,
        licensee,
      })

      const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
      await cartRepository.create({
        contact,
        licensee: anotherLicensee,
      })

      let cart = await cartRepository.findFirst({ contact, licensee })
      expect(cart).toEqual(expect.objectContaining({ contact: contact._id, licensee: licensee._id }))
      expect(cart).not.toEqual(expect.objectContaining({ contact: contact._id, licensee: anotherLicensee._id }))

      cart = await cartRepository.findFirst({ licensee: anotherLicensee })
      expect(cart).toEqual(expect.objectContaining({ licensee: anotherLicensee._id }))
      expect(cart).not.toEqual(expect.objectContaining({ licensee: licensee._id }))

      cart = await cartRepository.findFirst({ licensee: anotherLicensee }, ['contact'])
      expect(cart.contact.number).toEqual('5511990283745')
    })
  })

  describe('#delete', () => {
    it('delete all cart', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee }))
      const cartData = { contact, licensee }

      const cartRepository = new CartRepositoryDatabase()
      await cartRepository.create(cartData)
      await cartRepository.create(cartData)

      const status = await cartRepository.delete()
      expect(status.acknowledged).toEqual(true)
    })
  })
})
