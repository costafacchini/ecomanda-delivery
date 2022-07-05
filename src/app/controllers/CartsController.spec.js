const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Cart = require('@models/Cart')
const request = require('supertest')
const mongoServer = require('../../../.jest/utils')
const { expressServer } = require('../../../.jest/server-express')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { cart: cartFactory } = require('@factories/cart')
const { createTextMessageInsteadInteractive } = require('@repositories/message')

jest.mock('@repositories/message')

describe('carts controller', () => {
  let licensee, contact
  let anotherLicensee, anotherContact

  beforeAll(async () => {
    await mongoServer.connect()

    licensee = await Licensee.create(licenseeFactory.build())
    contact = await Contact.create(contactFactory.build({ licensee }))

    anotherLicensee = await Licensee.create(licenseeFactory.build())
    anotherContact = await Contact.create(contactFactory.build({ licensee: anotherLicensee }))
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
      it('returns status 201 and the cart data if the create is successful', async () => {
        await request(expressServer)
          .post(`/api/v1/carts?token=${licensee.apiToken}`)
          .send(cartFactory.build({ contact: contact.number }))
          .expect('Content-Type', /json/)
          .expect(201)
          .then((response) => {
            expect(response.body.total).toEqual(18.3)
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

      it('returns status 422 and message if the cart is not valid', async () => {
        await request(expressServer)
          .post(`/api/v1/carts?token=${licensee.apiToken}`)
          .send(cartFactory.build({ contact: '5568902938567' }))
          .expect('Content-Type', /json/)
          .expect(422, {
            errors: { message: 'Contato 5568902938567 não encontrado' },
          })
      })

      it('returns status 500 and message if the some error ocurred when create the cart', async () => {
        const mockFunction = jest.spyOn(Cart.prototype, 'save').mockImplementation(() => {
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
        await Cart.create(cartFactory.build({ contact, licensee }))

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
            expect(response.body.total).toEqual(24.9)
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

      it('returns status 422 and message if the cart is not founded', async () => {
        await Cart.deleteMany({})

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .post(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const contactFindOneSpy = jest.spyOn(Contact, 'findOne').mockImplementation(() => {
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
        await Cart.create(cartFactory.build({ contact, licensee }))

        await request(expressServer)
          .get(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.total).toEqual(18.3)
            expect(response.body.concluded).toEqual(false)
            expect(response.body.contact._id.toString()).toEqual(contact._id.toString())
            expect(response.body.licensee._id.toString()).toEqual(licensee._id.toString())

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

      it('returns status 422 and message if the cart is not founded', async () => {
        await Cart.deleteMany({})

        await request(expressServer)
          .get(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .get(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if occurs another error', async () => {
        const contactFindOneSpy = jest.spyOn(Contact, 'findOne').mockImplementation(() => {
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
        await Cart.create(cartFactory.build({ contact, licensee }))

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

      it('returns status 422 and message if the cart is not founded', async () => {
        await Cart.deleteMany({})

        await request(expressServer)
          .delete(`/api/v1/carts/5511990283745?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .delete(`/api/v1/carts/551164646464?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const contactFindOneSpy = jest.spyOn(Contact, 'findOne').mockImplementation(() => {
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
        await Cart.create(cartFactory.build({ contact, licensee }))

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
            ],
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.body.total).toEqual(23.9)
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

      it('returns status 422 and message if the cart is not founded', async () => {
        await Cart.deleteMany({})

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745/item?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .post(`/api/v1/carts/551164646464/item?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const contactFindOneSpy = jest.spyOn(Contact, 'findOne').mockImplementation(() => {
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
        await Cart.create(cartFactory.build({ contact, licensee }))

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

      it('returns status 422 and message if the cart is not founded', async () => {
        await Cart.deleteMany({})

        await request(expressServer)
          .delete(`/api/v1/carts/5511990283745/item?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 422 and message if the contact is not founded', async () => {
        await request(expressServer)
          .delete(`/api/v1/carts/551164646464/item?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Contato 551164646464 não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const contactFindOneSpy = jest.spyOn(Contact, 'findOne').mockImplementation(() => {
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
        const cart = await Cart.create(cartFactory.build({ contact, licensee }))

        createTextMessageInsteadInteractive.mockResolvedValue({ _id: 'id' })

        await request(expressServer)
          .post(`/api/v1/carts/${cart._id}/send?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(200, {
            message: 'Carrinho agendado para envio',
          })
      })

      it('returns status 422 and message if the cart is not founded', async () => {
        await Cart.deleteMany({})

        await request(expressServer)
          .post(`/api/v1/carts/5511990283745/send?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(422, { errors: { message: 'Carrinho não encontrado' } })
      })

      it('returns status 500 and message if the some error ocurred when update the cart', async () => {
        const cart = await Cart.create(cartFactory.build({ contact, licensee }))

        createTextMessageInsteadInteractive.mockImplementation(() => {
          throw new Error('some error')
        })

        await request(expressServer)
          .post(`/api/v1/carts/${cart._id}/send?token=${licensee.apiToken}`)
          .expect('Content-Type', /json/)
          .expect(500, {
            errors: { message: 'Error: some error' },
          })

        createTextMessageInsteadInteractive.mockRestore()
      })
    })
  })
})
