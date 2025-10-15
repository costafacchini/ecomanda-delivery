import Cart from '@models/Cart'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { cart as cartFactory } from '@factories/cart'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'

describe('Cart', () => {
  let licensee
  let contact

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())

    const contactRepository = new ContactRepositoryDatabase()
    contact = await contactRepository.create(contactFactory.build({ licensee }))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const cart = await Cart.create(cartFactory.build({ contact, licensee }))

      expect(cart._id).not.toEqual(null)
    })

    it('does not changes _id if cart is changed', async () => {
      const cart = await Cart.create(cartFactory.build({ contact, licensee }))

      cart.catalog = 'Changed'
      const alteredCart = await cart.save()

      expect(cart._id).toEqual(alteredCart._id)
      expect(alteredCart.catalog).toEqual('Changed')
    })

    it('fills the fields that have a default value', () => {
      const cart = new Cart()

      expect(cart.total).toEqual(0)
      expect(cart.concluded).toEqual(false)
      expect(cart.delivery_tax).toEqual(0)
    })

    it('fills the total', async () => {
      const products = [
        {
          unit_price: 10,
          quantity: 2,
          product_retailer_id: '0123',
        },
        {
          unit_price: 20,
          quantity: 1,
          product_retailer_id: '0124',
        },
      ]

      const cart = await Cart.create(cartFactory.build({ delivery_tax: 5.0, products: products, contact, licensee }))

      expect(cart.total).toEqual(45)
    })
  })

  describe('post save', () => {
    it('updates the contact address with cart address', async () => {
      expect(contact.address).toEqual(undefined)
      expect(contact.address_number).toEqual(undefined)
      expect(contact.address_complement).toEqual(undefined)
      expect(contact.neighborhood).toEqual(undefined)
      expect(contact.city).toEqual(undefined)
      expect(contact.cep).toEqual(undefined)
      expect(contact.uf).toEqual(undefined)

      await Cart.create(
        cartFactory.build({
          contact,
          licensee,
          address: 'Rua Teste',
          address_number: '123',
          address_complement: 'Apto 123',
          neighborhood: 'Bairro Teste',
          city: 'São Paulo',
          cep: '01234567',
          uf: 'SP',
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      const contactUpdated = await contactRepository.findFirst({ _id: contact._id })

      expect(contactUpdated.address).toEqual('Rua Teste')
      expect(contactUpdated.address_number).toEqual('123')
      expect(contactUpdated.address_complement).toEqual('Apto 123')
      expect(contactUpdated.neighborhood).toEqual('Bairro Teste')
      expect(contactUpdated.city).toEqual('São Paulo')
      expect(contactUpdated.cep).toEqual('01234567')
      expect(contactUpdated.uf).toEqual('SP')
    })

    it('does not update the contact address if cart address is undefined', async () => {
      expect(contact.address).toEqual(undefined)
      expect(contact.address_number).toEqual(undefined)
      expect(contact.address_complement).toEqual(undefined)
      expect(contact.neighborhood).toEqual(undefined)
      expect(contact.city).toEqual(undefined)
      expect(contact.cep).toEqual(undefined)
      expect(contact.uf).toEqual(undefined)

      await Cart.create(
        cartFactory.build({
          contact,
          licensee,
          address: undefined,
          address_number: undefined,
          address_complement: undefined,
          neighborhood: undefined,
          city: undefined,
          cep: undefined,
          uf: undefined,
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      const contactUpdated = await contactRepository.findFirst({ _id: contact._id })

      expect(contactUpdated.address).toEqual(undefined)
      expect(contactUpdated.address_number).toEqual(undefined)
      expect(contactUpdated.address_complement).toEqual(undefined)
      expect(contactUpdated.neighborhood).toEqual(undefined)
      expect(contactUpdated.city).toEqual(undefined)
      expect(contactUpdated.cep).toEqual(undefined)
      expect(contactUpdated.uf).toEqual(undefined)
    })

    it('does not update the contact address if cart address is blank', async () => {
      expect(contact.address).toEqual(undefined)
      expect(contact.address_number).toEqual(undefined)
      expect(contact.address_complement).toEqual(undefined)
      expect(contact.neighborhood).toEqual(undefined)
      expect(contact.city).toEqual(undefined)
      expect(contact.cep).toEqual(undefined)
      expect(contact.uf).toEqual(undefined)

      await Cart.create(
        cartFactory.build({
          contact,
          licensee,
          address: '',
          address_number: '',
          address_complement: '',
          neighborhood: '',
          city: '',
          cep: '',
          uf: '',
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      const contactUpdated = await contactRepository.findFirst({ _id: contact._id })

      expect(contactUpdated.address).toEqual(undefined)
      expect(contactUpdated.address_number).toEqual(undefined)
      expect(contactUpdated.address_complement).toEqual(undefined)
      expect(contactUpdated.neighborhood).toEqual(undefined)
      expect(contactUpdated.city).toEqual(undefined)
      expect(contactUpdated.cep).toEqual(undefined)
      expect(contactUpdated.uf).toEqual(undefined)
    })
  })

  describe('validations', () => {
    describe('contact', () => {
      it('is required', () => {
        const cart = new Cart()
        const validation = cart.validateSync()

        expect(validation.errors['contact'].message).toEqual('Contact: Você deve preencher o campo')
      })
    })

    describe('licensee', () => {
      it('is required', () => {
        const cart = new Cart()
        const validation = cart.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })
  })

  describe('calculateTotal', () => {
    it('returns the sum of all products', () => {
      const cart = new Cart()

      cart.delivery_tax = 2
      cart.products = [
        {
          unit_price: 10,
          quantity: 2,
          additionals: [
            {
              quantity: 1,
              unit_price: 0.5,
              details: [
                {
                  quantity: 1,
                  unit_price: 0.1,
                },
                {
                  quantity: 2,
                  unit_price: 0.2,
                },
              ],
            },
            {
              quantity: 2,
              unit_price: 0.3,
            },
          ],
        },
        {
          unit_price: 20,
          quantity: 1,
        },
      ]

      expect(cart.calculateTotal()).toEqual(42)
    })
  })

  describe('calculateTotalItem', () => {
    it('returns the sum of an item', () => {
      const cart = new Cart()

      cart.products = [
        {
          unit_price: 10,
          quantity: 2,
          additionals: [
            {
              quantity: 1,
              unit_price: 0.5,
              details: [
                {
                  quantity: 1,
                  unit_price: 0.1,
                },
                {
                  quantity: 2,
                  unit_price: 0.2,
                },
              ],
            },
            {
              quantity: 2,
              unit_price: 0.3,
            },
          ],
        },
      ]

      expect(cart.calculateTotalItem(cart.products[0])).toEqual(20)
    })
  })
})
