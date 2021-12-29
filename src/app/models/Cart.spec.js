const Cart = require('@models/Cart')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const mongoServer = require('../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { cart: cartFactory } = require('@factories/cart')

describe('Cart', () => {
  let licensee
  let contact

  beforeEach(async () => {
    await mongoServer.connect()

    licensee = await Licensee.create(licenseeFactory.build())
    contact = await Contact.create(contactFactory.build({ licensee }))
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
})
