import { ContactRepositoryDatabase } from '@repositories/contact'
import request from 'supertest'
import mongoServer from '../../../.jest/utils'
import { expressServer } from '../../../.jest/server-express'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { cart as cartFactory } from '@factories/cart'
import { publishMessage } from '@config/rabbitmq'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { CartRepositoryDatabase } from '@repositories/cart'
import { MessageRepositoryDatabase } from '@repositories/message'
import { logger } from '../../setup/logger.js'

jest.mock('../../setup/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}))

jest.mock('@config/rabbitmq', () => ({
  publishMessage: jest.fn(),
}))

describe('carts controller', () => {
  let licensee, contact
  let anotherLicensee, anotherContact
  const loggerInfoSpy = logger.info

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build({ cartDefault: 'go2go' }))
    const contactRepository = new ContactRepositoryDatabase()
    contact = await contactRepository.create(contactFactory.build({ licensee }))

    anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
    anotherContact = await contactRepository.create(contactFactory.build({ licensee: anotherLicensee }))
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('about auth', () => {
    it('returns status 401 and message if query param token is not valid', async () => {
      await request(expressServer)
        .post('/api/v1/carts/?token=627365264')
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })

    it('returns status 401 and message if query param token is informed', async () => {
      await request(expressServer)
        .post('/api/v1/carts')
        .expect('Content-Type', /json/)
        .expect(401, { message: 'Token não informado ou inválido.' })
    })
  })

  describe('create', () => {
    describe('response', () => {
      beforeEach(async () => {
        await new CartRepositoryDatabase().delete()
      })

      it('returns status 201 and the cart data if the create is successful', async () => {
        await request(expressServer)
          .post(`/api/v1/carts?token=${licensee.apiToken}`)
          .send(cartFactory.build({ contact: contact.number }))
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.total).toEqual(16.1)
            expect(response.body.concluded).toEqual(false)
            expect(response.body.contact).toEqual(contact._id.toString())
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body.products.length).toEqual(1)
            expect(response.body.products[0].product_retailer_id).toEqual('0123')
            expect(response.body.products[0].name).toEqual('Product 1')
            expect(response.body.products[0].quantity).toEqual(2)
            expect(response.body.products[0].unit_price).toEqual(7.8)

            expect(response.body.products[0].additionals.length).toEqual(1)
            expect(response.body.products[0].additionals[0].name).toEqual('Additional 1')
            expect(response.body.products[0].additionals[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].unit_price).toEqual(0.5)

            expect(response.body.products[0].additionals[0].details.length).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].name).toEqual('Detail 1')
            expect(response.body.products[0].additionals[0].details[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].unit_price).toEqual(0.6)

            expect(response.body._id).toBeDefined()
            expect(response.body.contact).not.toEqual(anotherContact._id.toString())
          })
      })

      it('returns status 201 and the cart data if the contact send by url param', async () => {
        const cartWithoutContact = cartFactory.build({ contact: null })

        await request(expressServer)
          .post(`/api/v1/carts?token=${licensee.apiToken}&contact=${contact.number}`)
          .send(cartWithoutContact)
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.total).toEqual(16.1)
            expect(response.body.concluded).toEqual(false)
            expect(response.body.contact).toEqual(contact._id.toString())
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body.products.length).toEqual(1)
            expect(response.body.products[0].product_retailer_id).toEqual('0123')
            expect(response.body.products[0].name).toEqual('Product 1')
            expect(response.body.products[0].quantity).toEqual(2)
            expect(response.body.products[0].unit_price).toEqual(7.8)

            expect(response.body.products[0].additionals.length).toEqual(1)
            expect(response.body.products[0].additionals[0].name).toEqual('Additional 1')
            expect(response.body.products[0].additionals[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].unit_price).toEqual(0.5)

            expect(response.body.products[0].additionals[0].details.length).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].name).toEqual('Detail 1')
            expect(response.body.products[0].additionals[0].details[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].unit_price).toEqual(0.6)

            expect(response.body._id).toBeDefined()
            expect(response.body.contact).not.toEqual(anotherContact._id.toString())
          })
      })

      it('returns status 201, create contact and the cart data if the name are in params', async () => {
        await request(expressServer)
          .post(`/api/v1/carts?token=${licensee.apiToken}`)
          .send(cartFactory.build({ contact: '47890283745', name: 'Contact Name' }))
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.contact).toBeDefined()
            expect(response.body.contact).not.toEqual(contact._id.toString())
            expect(response.body.contact).not.toEqual(anotherContact._id.toString())
          })
      })

      it('returns status 201 and update cart data if the cart already exists', async () => {
        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .post(`/api/v1/carts?token=${licensee.apiToken}&contact=${contact.number}`)
          .send({
            products: [
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
          })
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.total).toEqual(18.1)
            expect(response.body.concluded).toEqual(false)
            expect(response.body.contact).toEqual(contact._id.toString())
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body.products.length).toEqual(2)
            expect(response.body.products[0].product_retailer_id).toEqual('0123')
            expect(response.body.products[0].name).toEqual('Product 1')
            expect(response.body.products[0].quantity).toEqual(2)
            expect(response.body.products[0].unit_price).toEqual(7.8)

            expect(response.body.products[0].additionals.length).toEqual(1)
            expect(response.body.products[0].additionals[0].name).toEqual('Additional 1')
            expect(response.body.products[0].additionals[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].unit_price).toEqual(0.5)

            expect(response.body.products[0].additionals[0].details.length).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].name).toEqual('Detail 1')
            expect(response.body.products[0].additionals[0].details[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].unit_price).toEqual(0.6)

            expect(response.body.products[1].product_retailer_id).toEqual('0124')
            expect(response.body.products[1].name).toEqual('Product 2')
            expect(response.body.products[1].quantity).toEqual(1)
            expect(response.body.products[1].unit_price).toEqual(1.0)

            expect(response.body.products[1].additionals.length).toEqual(1)
            expect(response.body.products[1].additionals[0].name).toEqual('Additional 2')
            expect(response.body.products[1].additionals[0].quantity).toEqual(2)
            expect(response.body.products[1].additionals[0].unit_price).toEqual(0.7)

            expect(response.body.products[1].additionals[0].details.length).toEqual(1)
            expect(response.body.products[1].additionals[0].details[0].name).toEqual('Detail 2')
            expect(response.body.products[1].additionals[0].details[0].quantity).toEqual(2)
            expect(response.body.products[1].additionals[0].details[0].unit_price).toEqual(0.8)
          })
      })

      it('returns status 500 and message if the some error ocurred when create the cart', async () => {
        const mockFunction = jest.spyOn(CartRepositoryDatabase.prototype, 'create').mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post(`/api/v1/carts?token=${licensee.apiToken}`)
          .send(cartFactory.build({ contact: contact.number }))
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        mockFunction.mockRestore()
      })
    })
  })

  describe('update', () => {
    describe('response', () => {
      it('returns status 200 and the cart data if the update is successful', async () => {
        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .send({
            products: [
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
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.total).toEqual(18.1)
            expect(response.body.concluded).toEqual(true)
            expect(response.body.contact).toEqual(contact._id.toString())
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body.products.length).toEqual(2)
            expect(response.body.products[0].product_retailer_id).toEqual('0123')
            expect(response.body.products[0].name).toEqual('Product 1')
            expect(response.body.products[0].quantity).toEqual(2)
            expect(response.body.products[0].unit_price).toEqual(7.8)

            expect(response.body.products[0].additionals.length).toEqual(1)
            expect(response.body.products[0].additionals[0].name).toEqual('Additional 1')
            expect(response.body.products[0].additionals[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].unit_price).toEqual(0.5)

            expect(response.body.products[0].additionals[0].details.length).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].name).toEqual('Detail 1')
            expect(response.body.products[0].additionals[0].details[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].unit_price).toEqual(0.6)

            expect(response.body.products[1].product_retailer_id).toEqual('0124')
            expect(response.body.products[1].name).toEqual('Product 2')
            expect(response.body.products[1].quantity).toEqual(1)
            expect(response.body.products[1].unit_price).toEqual(1.0)

            expect(response.body.products[1].additionals.length).toEqual(1)
            expect(response.body.products[1].additionals[0].name).toEqual('Additional 2')
            expect(response.body.products[1].additionals[0].quantity).toEqual(2)
            expect(response.body.products[1].additionals[0].unit_price).toEqual(0.7)

            expect(response.body.products[1].additionals[0].details.length).toEqual(1)
            expect(response.body.products[1].additionals[0].details[0].name).toEqual('Detail 2')
            expect(response.body.products[1].additionals[0].details[0].quantity).toEqual(2)
            expect(response.body.products[1].additionals[0].details[0].unit_price).toEqual(0.8)
          })
      })

      it('returns status 200 and message if the cart is not founded', async () => {
        await new CartRepositoryDatabase().delete()

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .post(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .send({ delivery_tax: 1.5 })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('show', () => {
    describe('response', () => {
      it('returns status 200 and message if cart exists', async () => {
        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .get(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.cart).toEqual(
              '*ALCATEIA LTDS*' +
                '\n' +
                'Data: 03/07/2021 00:00' +
                '\n' +
                ' ' +
                '\n' +
                '*Cliente:* undefined' +
                '\n' +
                '*Telefone:* 11990283745' +
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
                '2x Product 1 - R$ 7.80' +
                '\n' +
                '   2x Additional 1' +
                '\n' +
                '______________' +
                '\n' +
                ' ' +
                '\n' +
                'Subtotal: R$ 15.60' +
                '\n' +
                'Taxa Entrega: R$ 0.50' +
                '\n' +
                'Desconto: R$ 0.00' +
                '\n' +
                '*TOTAL:* R$ 16.10' +
                '\n' +
                ' ' +
                '\n' +
                '*FORMA DE PAGAMENTO*' +
                '\n' +
                '0' +
                '\n' +
                ' ' +
                '\n' +
                '*TROCO PARA:* R$ 0.00',
            )
          })
      })

      it('returns status 200 and message if the cart is not founded', async () => {
        await new CartRepositoryDatabase().delete()

        await request(expressServer)
          .get(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .get(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .get(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('close', () => {
    describe('response', () => {
      it('returns status 200 and the cart data if the close is successful', async () => {
        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .delete(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.concluded).toEqual(true)
            expect(response.body.contact).toEqual(contact._id.toString())
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body.products.length).toEqual(1)
            expect(response.body.products[0].product_retailer_id).toEqual('0123')
            expect(response.body.products[0].name).toEqual('Product 1')
            expect(response.body.products[0].quantity).toEqual(2)
            expect(response.body.products[0].unit_price).toEqual(7.8)

            expect(response.body.products[0].additionals.length).toEqual(1)
            expect(response.body.products[0].additionals[0].name).toEqual('Additional 1')
            expect(response.body.products[0].additionals[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].unit_price).toEqual(0.5)

            expect(response.body.products[0].additionals[0].details.length).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].name).toEqual('Detail 1')
            expect(response.body.products[0].additionals[0].details[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].unit_price).toEqual(0.6)
          })
      })

      it('returns status 200 and message if the cart is not founded', async () => {
        await new CartRepositoryDatabase().delete()

        await request(expressServer)
          .delete(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .delete(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .delete(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .send({ delivery_tax: 1.5 })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('addItem', () => {
    describe('response', () => {
      it('returns status 200 and the cart data if the item added with successful', async () => {
        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745/item?token=${licensee.apiToken}`)
          .send({
            products: [
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
              {
                product_retailer_id: '0123',
                quantity: 1,
              },
            ],
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.total).toEqual(24.9)
            expect(response.body.concluded).toEqual(false)
            expect(response.body.contact).toEqual(contact._id.toString())
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body.products.length).toEqual(2)
            expect(response.body.products[0].product_retailer_id).toEqual('0123')
            expect(response.body.products[0].name).toEqual('Product 1')
            expect(response.body.products[0].quantity).toEqual(3)
            expect(response.body.products[0].unit_price).toEqual(7.8)

            expect(response.body.products[0].additionals.length).toEqual(1)
            expect(response.body.products[0].additionals[0].name).toEqual('Additional 1')
            expect(response.body.products[0].additionals[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].unit_price).toEqual(0.5)

            expect(response.body.products[0].additionals[0].details.length).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].name).toEqual('Detail 1')
            expect(response.body.products[0].additionals[0].details[0].quantity).toEqual(1)
            expect(response.body.products[0].additionals[0].details[0].unit_price).toEqual(0.6)

            expect(response.body.products[1].product_retailer_id).toEqual('0124')
            expect(response.body.products[1].name).toEqual('Product 2')
            expect(response.body.products[1].quantity).toEqual(1)
            expect(response.body.products[1].unit_price).toEqual(1.0)

            expect(response.body.products[1].additionals.length).toEqual(1)
            expect(response.body.products[1].additionals[0].name).toEqual('Additional 2')
            expect(response.body.products[1].additionals[0].quantity).toEqual(2)
            expect(response.body.products[1].additionals[0].unit_price).toEqual(0.7)

            expect(response.body.products[1].additionals[0].details.length).toEqual(1)
            expect(response.body.products[1].additionals[0].details[0].name).toEqual('Detail 2')
            expect(response.body.products[1].additionals[0].details[0].quantity).toEqual(2)
            expect(response.body.products[1].additionals[0].details[0].unit_price).toEqual(0.8)
          })
      })

      it('returns status 200 and message if the cart is not founded', async () => {
        await new CartRepositoryDatabase().delete()

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745/item?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .post(`/api/v1/carts/551164646464/item?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745/item?token=${licensee.apiToken}`)
          .send({ delivery_tax: 1.5 })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('removeItem', () => {
    describe('response', () => {
      it('returns status 200 and the cart data if the item removed with successful', async () => {
        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .delete(`/api/v1/carts/5511990283745/item?token=${licensee.apiToken}`)
          .send({ item: 1 })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.total).toEqual(0.5)
            expect(response.body.concluded).toEqual(false)
            expect(response.body.contact).toEqual(contact._id.toString())
            expect(response.body.licensee).toEqual(licensee._id.toString())

            expect(response.body.products.length).toEqual(0)
          })
      })

      it('returns status 200 and message if the cart is not founded', async () => {
        await new CartRepositoryDatabase().delete()

        await request(expressServer)
          .delete(`/api/v1/carts/5511990283745/item?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .delete(`/api/v1/carts/551164646464/item?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .delete(`/api/v1/carts/5511990283745/item?token=${licensee.apiToken}`)
          .send({ delivery_tax: 1.5 })
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('send', () => {
    describe('response', () => {
      it('returns status 200 and schedules to send message if the item removed with successful', async () => {
        jest
          .spyOn(MessageRepositoryDatabase.prototype, 'createTextMessageInsteadInteractive')
          .mockImplementation(() => {
            return {
              _id: 'id',
            }
          })

        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745/send?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, {
            message: 'Carrinho agendado para envio',
          })
      })

      it('returns status 200 and message if the cart is not founded', async () => {
        await new CartRepositoryDatabase().delete()

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745/send?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        jest
          .spyOn(MessageRepositoryDatabase.prototype, 'createTextMessageInsteadInteractive')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745/send?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })
      })
    })
  })

  describe('getCart', () => {
    describe('response', () => {
      it('returns status 200 and message if cart exists', async () => {
        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .get(`/api/v1/carts/5511990283745/cart?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.order.deliveryMode).toEqual('MERCHANT')
            expect(response.body.order.docNotaFiscal).toEqual(false)
            expect(response.body.order.documento).toEqual('')
            expect(response.body.order.endEntrega).toEqual('')
            expect(response.body.order.flagIntegrado).toEqual('NaoIntegrado')
            expect(response.body.order.impostos).toEqual(0)
            expect(response.body.order.origemId).toEqual(0)
            expect(response.body.order.refCurtaOrigem).toEqual('')
            expect(response.body.order.refOrigem).toEqual('Ecommerce')
            expect(response.body.order.refPedido).toEqual('Ecommerce')
            expect(response.body.order.subTotal).toEqual(15.600000000000001)
            expect(response.body.order.taxaEntrega).toEqual(0.5)
            expect(response.body.order.telefonePedido).toEqual('5511990283745')
            expect(response.body.order.totalPedido).toEqual(16.1)
            expect(response.body.order.valorDocNotaFiscal).toEqual('')
            expect(response.body.order.valorPagar).toEqual(16.1)
            expect(response.body.order.voucher).toEqual(0)

            expect(response.body.order.entrega.data).toEqual('')
            expect(response.body.order.entrega.endereco.id).toEqual(37025)
            expect(response.body.order.entrega.endereco.padrao).toEqual(false)
            expect(response.body.order.entrega.endereco.pais).toEqual('Brasil')
            expect(response.body.order.entrega.retiraLoja).toEqual(false)
            expect(response.body.order.entrega.retirada).toEqual('Hoje')

            expect(response.body.order.itens[0].precoTotal).toEqual(7.8)
            expect(response.body.order.itens[0].produtoId).toEqual('0123')
            expect(response.body.order.itens[0].quantidade).toEqual(2)
            expect(response.body.order.itens[0].adicionalPedidoItems[0].atributoValorId).toEqual('Detail 1')
            expect(response.body.order.itens[0].adicionalPedidoItems[0].precoTotal).toEqual(0.5)
            expect(response.body.order.itens[0].adicionalPedidoItems[0].produtoId).toEqual('Additional 1')
            expect(response.body.order.itens[0].adicionalPedidoItems[0].quantidade).toEqual(1)

            expect(response.body.order.pagamentos[0].bandeira).toEqual(0)
            expect(response.body.order.pagamentos[0].codigoResposta).toEqual('')
            expect(response.body.order.pagamentos[0].descontoId).toEqual(0)
            expect(response.body.order.pagamentos[0].nsu).toEqual(0)
            expect(response.body.order.pagamentos[0].observacao).toEqual('')
            expect(response.body.order.pagamentos[0].prePago).toEqual(false)
            expect(response.body.order.pagamentos[0].status).toEqual('NaoInformado')
            expect(response.body.order.pagamentos[0].tipo).toEqual('')
            expect(response.body.order.pagamentos[0].transactionId).toEqual(0)
            expect(response.body.order.pagamentos[0].troco).toEqual(0)
            expect(response.body.order.pagamentos[0].valor).toEqual(16.1)
          })
      })

      it('returns status 200 and message if the cart is not founded', async () => {
        await new CartRepositoryDatabase().delete()

        await request(expressServer)
          .get(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .get(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .get(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('getPayment', () => {
    describe('response', () => {
      it('returns status 200 and message if cart exists', async () => {
        const cartRepository = new CartRepositoryDatabase()
        await cartRepository.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .get(`/api/v1/carts/5511990283745/payment?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.payment_status).toEqual('waiting')
            expect(response.body.integration_status).toEqual('pending')
            expect(response.body.cart_id).toBeDefined()
          })
      })

      it('returns status 200 and message if the cart is not founded', async () => {
        await new CartRepositoryDatabase().delete()

        await request(expressServer)
          .get(`/api/v1/carts/5511990283745/payment?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .get(`/api/v1/carts/551164646464/payment?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const contactFindOneSpy = jest
          .spyOn(ContactRepositoryDatabase.prototype, 'findFirst')
          .mockImplementation(() => {
            throw new Error('some error')
          })

        await request(expressServer)
          .get(`/api/v1/carts/551164646464/payment?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        contactFindOneSpy.mockRestore()
      })
    })
  })

  describe('reset', () => {
    describe('response', () => {
      it('returns status 200 and schedule job to reset chat window', async () => {
        await request(expressServer)
          .post(`/api/v1/carts/reset?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body).toEqual({
              body: 'Solicitação para avisar os carts com janela vencendo agendado com sucesso',
            })
            expect(publishMessage).toHaveBeenCalledWith({ key: 'reset-carts', body: {} })

            expect(loggerInfoSpy).toHaveBeenCalledTimes(1)
            expect(loggerInfoSpy).toHaveBeenCalledWith('Agendando para resetar carts expirando')
          })
      })
    })
  })
})
