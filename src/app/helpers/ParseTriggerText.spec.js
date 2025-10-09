import Product from '@models/Product.js'
import mongoServer from '../../../.jest/utils.js'
import { parseText, parseCart  } from './ParseTriggerText.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { cart as cartFactory   } from '@factories/cart.js'
import { product as productFactory   } from '@factories/product.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { CartRepositoryDatabase  } from '@repositories/cart.js'

describe('ParseTriggerText', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })
  describe('#parseText', () => {
    describe('$last_cart_resume', () => {
      it('replaces by cart data', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))

        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ licensee, contact, concluded: true }))

        const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
        await cartRepository.create(
          cartFactory.build({
            licensee,
            contact,
            products: [
              {
                product_retailer_id: '0123',
                name: 'Product',
                quantity: 2,
                unit_price: 7.8,
                additionals: [{ name: 'Adicional 1', quantity: 1 }],
                note: 'Without suggar',
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
            partner_key: '9164',
            payment_method: 'Cartão de crédito - Master',
            note: 'Deliver in hands',
            points: true,
          }),
        )

        expect(await parseText('This is your cart \n $last_cart_resume', contact)).toEqual(
          'This is your cart ' +
            '\n' +
            ' *ALCATEIA LTDS - PEDIDO 9164*' +
            '\n' +
            'Data: 03/07/2021 00:00' +
            '\n' +
            ' ' +
            '\n' +
            '*Cliente:* John Doe' +
            '\n' +
            '*Telefone:* 11990283745' +
            '\n' +
            '*Entrega:* Rua do Contato, 123, 123 - Apto. 123' +
            '\n' +
            '         Centro - São Paulo/SP - 01234567' +
            '\n' +
            '______________' +
            '\n' +
            ' ' +
            '\n' +
            '*ITENS DO PEDIDO*' +
            '\n' +
            ' ' +
            '\n' +
            ' ' +
            '\n' +
            '2x Product - R$ 7.80' +
            '\n' +
            '   2x Adicional 1' +
            '\n' +
            '1x Product 1 - R$ 3.50' +
            '\n' +
            '______________' +
            '\n' +
            ' ' +
            '\n' +
            'Subtotal: R$ 19.10' +
            '\n' +
            'Taxa Entrega: R$ 0.50' +
            '\n' +
            'Desconto: R$ 0.00' +
            '\n' +
            '*TOTAL:* R$ 19.60' +
            '\n' +
            ' ' +
            '\n' +
            '*FORMA DE PAGAMENTO*' +
            '\n' +
            'Cartão de crédito - Master' +
            '\n' +
            ' ' +
            '\n' +
            '*TROCO PARA:* R$ 0.00' +
            '\n' +
            '______________' +
            '\n' +
            '*OBSERVACOES*' +
            '\n' +
            'Deliver in hands' +
            '\n' +
            'Pontos Ganhos Fidelidade: 19',
        )
      })

      describe('when the cart has no address', () => {
        it('replaces by cart data without address', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeFactory.build())

          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))

          const cartRepository = new CartRepositoryDatabase()
          await cartRepository.create(cartFactory.build({ licensee, contact, concluded: true }))

          const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
          await cartRepository.create(
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
            }),
          )

          expect(await parseText('This is your cart \n $last_cart_resume', contact)).not.toContain('*Entrega:*')
        })
      })

      describe('when the cart address is incomplete', () => {
        it('replaces by cart data with address incomplete', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeFactory.build())

          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))

          const cartRepository = new CartRepositoryDatabase()
          await cartRepository.create(cartFactory.build({ licensee, contact, concluded: true }))

          const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
          await cartRepository.create(
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
              address_number: null,
              address_complement: null,
              neighborhood: null,
              city: null,
              uf: null,
              cep: null,
            }),
          )

          const text = await parseText('This is your cart \n $last_cart_resume', contact)
          expect(text).toContain('Rua do Contato, 123')
          expect(text).not.toContain('null')
        })
      })

      describe('when the cart has no partner key', () => {
        it('replaces by cart data without partner key', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeFactory.build())

          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))

          const cartRepository = new CartRepositoryDatabase()
          await cartRepository.create(cartFactory.build({ licensee, contact, concluded: true }))

          const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
          await cartRepository.create(
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
              payment_method: null,
            }),
          )

          expect(await parseText('This is your cart \n $last_cart_resume', contact)).not.toContain(
            '*FORMA DE PAGAMENTO*',
          )
        })
      })

      describe('when the cart has no payment method', () => {
        it('replaces by cart data without payment method', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeFactory.build())

          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))

          const cartRepository = new CartRepositoryDatabase()
          await cartRepository.create(cartFactory.build({ licensee, contact, concluded: true }))

          const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
          await cartRepository.create(
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
              partner_key: null,
            }),
          )

          expect(await parseText('This is your cart \n $last_cart_resume', contact)).not.toContain('PEDIDO 9164')
        })
      })

      describe('when the cart has no note', () => {
        it('replaces by cart data without note', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeFactory.build())

          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))

          const cartRepository = new CartRepositoryDatabase()
          await cartRepository.create(cartFactory.build({ licensee, contact, concluded: true }))

          const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
          await cartRepository.create(
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
              note: null,
            }),
          )

          expect(await parseText('This is your cart \n $last_cart_resume', contact)).not.toContain('*OBSERVACOES*')
        })
      })

      describe('when the cart has no points', () => {
        it('replaces by cart data without note', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeFactory.build())

          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))

          const cartRepository = new CartRepositoryDatabase()
          await cartRepository.create(cartFactory.build({ licensee, contact, concluded: true }))

          const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
          await cartRepository.create(
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
              points: false,
            }),
          )

          expect(await parseText('This is your cart \n $last_cart_resume', contact)).not.toContain(
            'Pontos Ganhos Fidelidade:',
          )
        })
      })

      describe('when the payment method is cart', () => {
        it('replaces by cart data without change', async () => {
          const licenseeRepository = new LicenseeRepositoryDatabase()
          const licensee = await licenseeRepository.create(licenseeFactory.build())

          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))

          const cartRepository = new CartRepositoryDatabase()
          await cartRepository.create(cartFactory.build({ licensee, contact, concluded: true }))

          const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
          await cartRepository.create(
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
              payment_method: 'master',
            }),
          )

          expect(await parseText('This is your cart \n $last_cart_resume', contact)).not.toContain('*TROCO PARA:*')
        })
      })
    })

    describe('$contact_name', () => {
      it('replaces by the contact name', async () => {
        const contact = contactFactory.build({ name: 'John Doe' })

        const text = await parseText('Text that contains $contact_name that should be changed', contact)
        expect(text).toEqual('Text that contains John Doe that should be changed')
      })
    })

    describe('$contact_number', () => {
      it('replaces the contact phone', async () => {
        const contact = contactFactory.build({ name: 'John Doe', number: '5511990283745' })

        expect(await parseText('Text that contains $contact_number that should be changed', contact)).toEqual(
          'Text that contains 5511990283745 that should be changed',
        )
      })
    })

    describe('$contact_address_complete', () => {
      it('replaces by the contact address complete', async () => {
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
            'São Paulo - SP',
        )
      })
    })
  })

  describe('#parseCart', () => {
    it('returns cart data', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ name: 'John Doe', licensee }))
      const cartRepository = new CartRepositoryDatabase()

      const product = await Product.create(productFactory.build({ name: 'Product 1', licensee }))
      const cart = await cartRepository.create(
        cartFactory.build({
          licensee,
          contact,
          products: [
            {
              product_retailer_id: '0123',
              name: 'Product',
              quantity: 2,
              unit_price: 7.8,
              additionals: [{ name: 'Adicional 1', quantity: 1 }],
              note: 'Without suggar',
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
          partner_key: '9164',
          payment_method: 'Cartão de crédito - Master',
          note: 'Deliver in hands',
          points: true,
        }),
      )

      expect(await parseCart(cart._id)).toEqual(
        '*ALCATEIA LTDS - PEDIDO 9164*' +
          '\n' +
          'Data: 03/07/2021 00:00' +
          '\n' +
          ' ' +
          '\n' +
          '*Cliente:* John Doe' +
          '\n' +
          '*Telefone:* 11990283745' +
          '\n' +
          '*Entrega:* Rua do Contato, 123, 123 - Apto. 123' +
          '\n' +
          '         Centro - São Paulo/SP - 01234567' +
          '\n' +
          '______________' +
          '\n' +
          ' ' +
          '\n' +
          '*ITENS DO PEDIDO*' +
          '\n' +
          ' ' +
          '\n' +
          ' ' +
          '\n' +
          '2x Product - R$ 7.80' +
          '\n' +
          '   2x Adicional 1' +
          '\n' +
          '1x Product 1 - R$ 3.50' +
          '\n' +
          '______________' +
          '\n' +
          ' ' +
          '\n' +
          'Subtotal: R$ 19.10' +
          '\n' +
          'Taxa Entrega: R$ 0.50' +
          '\n' +
          'Desconto: R$ 0.00' +
          '\n' +
          '*TOTAL:* R$ 19.60' +
          '\n' +
          ' ' +
          '\n' +
          '*FORMA DE PAGAMENTO*' +
          '\n' +
          'Cartão de crédito - Master' +
          '\n' +
          ' ' +
          '\n' +
          '*TROCO PARA:* R$ 0.00' +
          '\n' +
          '______________' +
          '\n' +
          '*OBSERVACOES*' +
          '\n' +
          'Deliver in hands' +
          '\n' +
          'Pontos Ganhos Fidelidade: 19',
      )
    })
  })
})
