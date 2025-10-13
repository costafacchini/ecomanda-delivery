import { Gallabox } from './Gallabox.js'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'

describe('Gallabox plugin', () => {
  describe('#parseCart', () => {
    it('returns the cart normalized from plugin format', () => {
      const licensee = licenseeFactory.build({
        unidadeId: '123',
        statusId: '743',
        productFractionals: `{
            "products": [
              { "id": "5647", "name": "Pizza Grande (2 sabores)" }
            ]
          }`,
      })

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
        cep: '12345678',
      })

      const cartGallabox = {
        order: {
          catalog_id: '1321040298747904',
          product_items: [
            {
              product_retailer_id: '83921',
              item_price: 88,
              quantity: 1,
              currency: 'BRL',
            },
            {
              product_retailer_id: '83906',
              item_price: 89,
              quantity: 1,
              currency: 'BRL',
            },
            {
              product_retailer_id: '83908',
              item_price: 95,
              quantity: 1,
              currency: 'BRL',
            },
          ],
          products: [
            {
              fbProductId: '4939381689498702',
              retailer_id: '83921',
              name: '1/2 Portuguesa',
              description: 'Mozzarella Roni coberta com presunto, ovo cozido e rodelas de cebola - #5647',
              price: 'R$88.00',
              image_url: 'https://labraciera.com.br/wp-content/uploads/2022/12/GIU01240-768x748.jpg',
            },
            {
              fbProductId: '5440587292720086',
              retailer_id: '83906',
              name: '1/2 Castelões',
              description: 'Mozzarela italiana Fior di Latte e calabresa artesanal Cinque - #5647',
              price: 'R$89.00',
              image_url: 'https://labraciera.com.br/wp-content/uploads/2022/06/CASTELOES-Otimizado.jpg',
            },
            {
              fbProductId: '5676467839108717',
              retailer_id: '83908',
              name: 'Napoli In Higienopolis Grande',
              description: 'Catupiry®, carne seca desfiada e tomates cereja assados - #5647',
              price: 'R$95.00',
              image_url: 'https://labraciera.com.br/wp-content/uploads/2022/06/NAPOLI-IN-HIGIENOPOLIS-Otimizado.jpg',
            },
          ],
        },
      }

      const gallabox = new Gallabox()
      const cart = gallabox.parseCart(licensee, contact, cartGallabox)

      expect(cart.contact).toEqual(contact._id)
      expect(cart.licensee).toEqual(licensee._id)

      expect(cart.delivery_tax).toEqual(0)
      expect(cart.discount).toEqual(0)
      expect(cart.concluded).toEqual(false)
      expect(cart.catalog).toEqual('1321040298747904')
      expect(cart.address).toEqual('Rua dos Bobos')
      expect(cart.address_number).toEqual('123')
      expect(cart.address_complement).toEqual('Sala 1')
      expect(cart.neighborhood).toEqual('Centro')
      expect(cart.city).toEqual('Santos')
      expect(cart.cep).toEqual('12345678')
      expect(cart.uf).toEqual('SP')
      expect(cart.note).toEqual('')
      expect(cart.change).toEqual(0)
      expect(cart.partner_key).toEqual('')
      expect(cart.payment_method).toEqual('')
      expect(cart.points).toEqual(false)

      expect(cart.products.length).toEqual(2)

      expect(cart.products[0].product_retailer_id).toEqual('5647')
      expect(cart.products[0].name).toEqual('Pizza Grande (2 sabores)')
      expect(cart.products[0].quantity).toEqual(1)
      expect(cart.products[0].unit_price).toEqual(177)
      expect(cart.products[0].note).toEqual('')
      expect(cart.products[0].product_fb_id).toEqual('')

      expect(cart.products[0].additionals[0].product_retailer_id).toEqual('83921')
      expect(cart.products[0].additionals[0].name).toEqual('1/2 Portuguesa')
      expect(cart.products[0].additionals[0].quantity).toEqual(1)
      expect(cart.products[0].additionals[0].unit_price).toEqual(88)
      expect(cart.products[0].additionals[0].note).toEqual(
        'Mozzarella Roni coberta com presunto, ovo cozido e rodelas de cebola - #5647',
      )
      expect(cart.products[0].additionals[0].product_fb_id).toEqual('4939381689498702')

      expect(cart.products[0].additionals[1].product_retailer_id).toEqual('83906')
      expect(cart.products[0].additionals[1].name).toEqual('1/2 Castelões')
      expect(cart.products[0].additionals[1].quantity).toEqual(1)
      expect(cart.products[0].additionals[1].unit_price).toEqual(89)
      expect(cart.products[0].additionals[1].note).toEqual(
        'Mozzarela italiana Fior di Latte e calabresa artesanal Cinque - #5647',
      )
      expect(cart.products[0].additionals[1].product_fb_id).toEqual('5440587292720086')

      expect(cart.products[1].product_retailer_id).toEqual('5647')
      expect(cart.products[1].name).toEqual('Pizza Grande (2 sabores)')
      expect(cart.products[1].quantity).toEqual(1)
      expect(cart.products[1].unit_price).toEqual(95)
      expect(cart.products[1].note).toEqual('')
      expect(cart.products[1].product_fb_id).toEqual('')

      expect(cart.products[1].additionals[0].product_retailer_id).toEqual('83908')
      expect(cart.products[1].additionals[0].name).toEqual('Napoli In Higienopolis Grande')
      expect(cart.products[1].additionals[0].quantity).toEqual(1)
      expect(cart.products[1].additionals[0].unit_price).toEqual(95)
      expect(cart.products[1].additionals[0].note).toEqual(
        'Catupiry®, carne seca desfiada e tomates cereja assados - #5647',
      )
      expect(cart.products[1].additionals[0].product_fb_id).toEqual('5676467839108717')
    })
  })
})
