const Default = require('./Default')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const mongoServer = require('../../../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { advanceTo, clear } = require('jest-date-mock')

describe('Default plugin', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    advanceTo(new Date('2021-01-05T10:25:47.000Z'))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
    clear()
  })

  describe('#parseCart', () => {
    it('returns the cart normalized from plugin format', async () => {
      const licensee = await Licensee.create(licenseeFactory.build({ unidadeId: '123', statusId: '743' }))

      const contact = await Contact.create(
        contactFactory.build({
          licensee,
          plugin_cart_id: '929787465',
          name: 'John Doe',
          email: 'john@doe.com',
          uf: 'SP',
          city: 'Santos',
          neighborhood: 'Centro',
          address: 'Rua dos Bobos',
          address_number: '123',
          address_complement: 'Sala 1',
          cep: '12345-678',
        })
      )

      const cartDefault = {
        products: [
          {
            product_retailer_id: '0123',
            name: 'Product 1',
            quantity: 2,
            unit_price: 7.8,
            additionals: [
              {
                name: 'Additional 1',
                quantity: 1,
                unit_price: 0.5,
                details: [
                  {
                    name: 'Detail 1',
                    quantity: 1,
                    unit_price: 0.6,
                  },
                ],
              },
            ],
          },
          {
            product_retailer_id: '0124',
            name: 'Product 2',
            quantity: 1,
            unit_price: 1.0,
            additionals: [
              {
                name: 'Additional 2',
                quantity: 2,
                unit_price: 0.7,
                details: [
                  {
                    name: 'Detail 2',
                    quantity: 2,
                    unit_price: 0.8,
                  },
                ],
              },
            ],
          },
        ],
        total: 5.5,
        delivery_tax: 1.5,
        concluded: true,
      }

      const pluginDefault = new Default()
      const cart = await pluginDefault.parseCart(licensee, contact, cartDefault)

      expect(cart.concluded).toEqual(true)
      expect(cart.contact).toEqual(contact._id)
      expect(cart.licensee).toEqual(licensee._id)

      expect(cart.products.length).toEqual(2)
      expect(cart.products[0].product_retailer_id).toEqual('0123')
      expect(cart.products[0].name).toEqual('Product 1')
      expect(cart.products[0].quantity).toEqual(2)
      expect(cart.products[0].unit_price).toEqual(7.8)

      expect(cart.products[0].additionals.length).toEqual(1)
      expect(cart.products[0].additionals[0].name).toEqual('Additional 1')
      expect(cart.products[0].additionals[0].quantity).toEqual(1)
      expect(cart.products[0].additionals[0].unit_price).toEqual(0.5)

      expect(cart.products[0].additionals[0].details.length).toEqual(1)
      expect(cart.products[0].additionals[0].details[0].name).toEqual('Detail 1')
      expect(cart.products[0].additionals[0].details[0].quantity).toEqual(1)
      expect(cart.products[0].additionals[0].details[0].unit_price).toEqual(0.6)

      expect(cart.products[1].product_retailer_id).toEqual('0124')
      expect(cart.products[1].name).toEqual('Product 2')
      expect(cart.products[1].quantity).toEqual(1)
      expect(cart.products[1].unit_price).toEqual(1.0)

      expect(cart.products[1].additionals.length).toEqual(1)
      expect(cart.products[1].additionals[0].name).toEqual('Additional 2')
      expect(cart.products[1].additionals[0].quantity).toEqual(2)
      expect(cart.products[1].additionals[0].unit_price).toEqual(0.7)

      expect(cart.products[1].additionals[0].details.length).toEqual(1)
      expect(cart.products[1].additionals[0].details[0].name).toEqual('Detail 2')
      expect(cart.products[1].additionals[0].details[0].quantity).toEqual(2)
      expect(cart.products[1].additionals[0].details[0].unit_price).toEqual(0.8)
    })
  })
})
