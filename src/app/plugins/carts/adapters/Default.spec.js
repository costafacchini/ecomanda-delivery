import Default from './Default'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'

describe('Default plugin', () => {
  describe('#parseCart', () => {
    it('returns the cart normalized from plugin format', () => {
      const licensee = licenseeFactory.build({ unidadeId: '123', statusId: '743' })

      const contact = contactFactory.build({
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

      const cartDefault = {
        products: [
          {
            product_retailer_id: '0123',
            name: 'Product 1',
            quantity: 2,
            unit_price: 7.8,
            additionals: [
              {
                product_retailer_id: '9876',
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
                product_retailer_id: '9875',
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
        latitude: '-12.3343',
        longitude: '-09.3343',
        location: 'next to avenue',
        documento: '987556544654',
        delivery_method: 'retirada',
        payment_method: '0',
      }

      const pluginDefault = new Default()
      const cart = pluginDefault.parseCart(licensee, contact, cartDefault)

      expect(cart.concluded).toEqual(true)
      expect(cart.contact).toEqual(contact._id)
      expect(cart.licensee).toEqual(licensee._id)
      expect(cart.latitude).toEqual('-12.3343')
      expect(cart.longitude).toEqual('-09.3343')
      expect(cart.location).toEqual('next to avenue')
      expect(cart.documento).toEqual('987556544654')
      expect(cart.delivery_method).toEqual('retirada')
      expect(cart.payment_method).toEqual('0')

      expect(cart.products.length).toEqual(2)
      expect(cart.products[0].product_retailer_id).toEqual('0123')
      expect(cart.products[0].name).toEqual('Product 1')
      expect(cart.products[0].quantity).toEqual(2)
      expect(cart.products[0].unit_price).toEqual(7.8)

      expect(cart.products[0].additionals.length).toEqual(1)
      expect(cart.products[0].additionals[0].name).toEqual('Additional 1')
      expect(cart.products[0].additionals[0].quantity).toEqual(1)
      expect(cart.products[0].additionals[0].unit_price).toEqual(0.5)
      expect(cart.products[0].additionals[0].product_retailer_id).toEqual('9876')

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
      expect(cart.products[1].additionals[0].product_retailer_id).toEqual('9875')

      expect(cart.products[1].additionals[0].details.length).toEqual(1)
      expect(cart.products[1].additionals[0].details[0].name).toEqual('Detail 2')
      expect(cart.products[1].additionals[0].details[0].quantity).toEqual(2)
      expect(cart.products[1].additionals[0].details[0].unit_price).toEqual(0.8)
    })
  })
})
