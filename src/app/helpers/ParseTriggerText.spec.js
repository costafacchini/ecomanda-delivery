const Cart = require('@models/Cart')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const Product = require('@models/Product')
const mongoServer = require('../../../.jest/utils')
const parseText = require('./ParseTriggerText')
const { contact: contactFactory } = require('@factories/contact')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { cart: cartFactory } = require('@factories/cart')
const { product: productFactory } = require('@factories/product')

describe('ParseTriggerText', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })
  describe('#parseText', () => {
    it('replaces the $last_cart_resume', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ name: 'John Doe', licensee }))
      await Cart.create(cartFactory.build({ licensee, contact, concluded: true }))

      // product: product.build({ product_retailer_id: '0123' }),
      const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
      await Cart.create(
        cartFactory.build({
          licensee,
          contact,
          products: [
            {
              product_retailer_id: '0123',
              name: 'Product',
              quantity: 2,
              unit_price: 7.8,
            },
            {
              product_retailer_id: '0456',
              quantity: 1,
              unit_price: 3.5,
              product,
            },
          ],
          delivery_tax: 0.5,
          concluded: false,
          address: 'Rua do Contato, 123',
          address_number: '123',
          address_complement: 'Apto. 123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          uf: 'SP',
          cep: '01234567',
        })
      )

      expect(await parseText('This is your cart \n $last_cart_resume', contact)).toEqual(
        'This is your cart ' +
          '\n' +
          ' Data: 03/07/2021 00:00' +
          '\n' +
          ' ' +
          '\n' +
          'Cliente: John Doe' +
          '\n' +
          'Telefone: 5511990283745' +
          '\n' +
          'Entrega: Rua do Contato, 123, 123 - Apto. 123' +
          '\n' +
          '         Centro - São Paulo/SP - 01234567' +
          '\n' +
          '______________' +
          '\n' +
          ' ' +
          '\n' +
          'PEDIDO' +
          '\n' +
          'QTD		PRODUTO' +
          '\n' +
          '______________' +
          '\n' +
          ' ' +
          '\n' +
          '2 - Product - $7.80' +
          '\n' +
          '1 - Product 1 - $3.50' +
          '\n' +
          '______________' +
          '\n' +
          'Subtotal: $19.10' +
          '\n' +
          'Taxa Entrega: $0.50' +
          '\n' +
          'Total: $19.60'
      )
    })

    it('replaces the $contact_name', async () => {
      const contact = contactFactory.build({ name: 'John Doe' })

      const text = await parseText('Text that contains $contact_name that should be changed', contact)
      expect(text).toEqual('Text that contains John Doe that should be changed')
    })

    it('replaces the $contact_number', async () => {
      const contact = contactFactory.build({ name: 'John Doe', number: '5511990283745' })

      expect(await parseText('Text that contains $contact_number that should be changed', contact)).toEqual(
        'Text that contains 5511990283745 that should be changed'
      )
    })

    it('replaces the $contact_address_complete', async () => {
      const contact = contactFactory.build({
        address: 'Rua do Contato, 123',
        address_number: '123',
        address_complement: 'Apto. 123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        uf: 'SP',
        cep: '01234567',
      })

      expect(await parseText('Text with $contact_address_complete', contact)).toEqual(
        'Text with Rua do Contato, 123, 123' +
          '\n' +
          'Apto. 123' +
          '\n' +
          'Centro' +
          '\n' +
          'CEP 01234567' +
          '\n' +
          'São Paulo - SP'
      )
    })
  })
})
