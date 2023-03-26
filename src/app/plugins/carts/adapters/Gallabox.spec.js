const Gallabox = require('./Gallabox')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const mongoServer = require('../../../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { advanceTo, clear } = require('jest-date-mock')

describe('Gallabox plugin', () => {
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

      const cartGallabox = {
        '0 Product Retailer Id': '83921',
        '0 Item Price': 88,
        '0 Quantity': 1,
        '0 Currency': 'BRL',
        '0 FbProductId': '4939381689498702',
        '0 Retailer Id': '83921',
        '0 Name': 'Portuguesa Grande',
        '0 Description': 'Mozzarella Roni coberta com presunto, ovo cozido e rodelas de cebola',
        '0 Price': 'R$88.00',
        '0 Image Url': 'https://labraciera.com.br/wp-content/uploads/2022/12/GIU01240-768x748.jpg',
        '1 Product Retailer Id': '83906',
        '1 Item Price': 89,
        '1 Quantity': 1,
        '1 Currency': 'BRL',
        '1 FbProductId': '5440587292720086',
        '1 Retailer Id': '83906',
        '1 Name': 'Castelões Grande',
        '1 Description': 'Mozzarela italiana Fior di Latte e calabresa artesanal Cinque',
        '1 Price': 'R$89.00',
        '1 Image Url': 'https://labraciera.com.br/wp-content/uploads/2022/06/CASTELOES-Otimizado.jpg',
        '2 Product Retailer Id': '83908',
        '2 Item Price': 95,
        '2 Quantity': 1,
        '2 Currency': 'BRL',
        '2 FbProductId': '5676467839108717',
        '2 Retailer Id': '83908',
        '2 Name': 'Napoli In Higienopolis Grande',
        '2 Description': 'Catupiry®, carne seca desfiada e tomates cereja assados',
        '2 Price': 'R$95.00',
        '2 Image Url': 'https://labraciera.com.br/wp-content/uploads/2022/06/NAPOLI-IN-HIGIENOPOLIS-Otimizado.jpg',
      }

      const gallabox = new Gallabox()
      const cart = await gallabox.parseCart(licensee, contact, cartGallabox)

      expect(cart.contact).toEqual(contact._id)
      expect(cart.licensee).toEqual(licensee._id)

      expect(cart.delivery_tax).toEqual(0)
      expect(cart.discount).toEqual(0)
      expect(cart.concluded).toEqual(false)
      expect(cart.catalog).toEqual('')
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

      expect(cart.products.length).toEqual(3)

      expect(cart.products[0].product_retailer_id).toEqual('83921')
      expect(cart.products[0].name).toEqual('Portuguesa Grande')
      expect(cart.products[0].quantity).toEqual(1)
      expect(cart.products[0].unit_price).toEqual(88)
      expect(cart.products[0].note).toEqual('Mozzarella Roni coberta com presunto, ovo cozido e rodelas de cebola')
      expect(cart.products[0].product_fb_id).toEqual('4939381689498702')

      expect(cart.products[1].product_retailer_id).toEqual('83906')
      expect(cart.products[1].name).toEqual('Castelões Grande')
      expect(cart.products[1].quantity).toEqual(1)
      expect(cart.products[1].unit_price).toEqual(89)
      expect(cart.products[1].note).toEqual('Mozzarela italiana Fior di Latte e calabresa artesanal Cinque')
      expect(cart.products[1].product_fb_id).toEqual('5440587292720086')

      expect(cart.products[2].product_retailer_id).toEqual('83908')
      expect(cart.products[2].name).toEqual('Napoli In Higienopolis Grande')
      expect(cart.products[2].quantity).toEqual(1)
      expect(cart.products[2].unit_price).toEqual(95)
      expect(cart.products[2].note).toEqual('Catupiry®, carne seca desfiada e tomates cereja assados')
      expect(cart.products[2].product_fb_id).toEqual('5676467839108717')
    })
  })
})
