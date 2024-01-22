const Licensee = require('@models/Licensee')
const mongoServer = require('../../../../.jest/utils')
const Pedidos10 = require('./Pedidos10')
const { createOrder } = require('@repositories/order')
const Order = require('./Pedidos10/Order')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { order: orderFactory } = require('@factories/order')

describe('Pedidos10 plugin', () => {
  const orderLoadFnSpy = jest.spyOn(Order.prototype, 'loadOrderFromDatabase').mockImplementation(() => {})
  const orderSaveFnSpy = jest.spyOn(Order.prototype, 'save').mockImplementation(() => {})

  beforeAll(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('#processOrder', () => {
    it('process order and save on database', async () => {
      const body = {
        MerchantExternalCode: '358b9068-34cf-4f96-b883-0d8192bc12dd',
        order: {
          id: '9967816',
          customer: {
            id: '14246',
            name: 'Anderson Felizari',
            phone: { number: '47988044298' },
            documentNumber: '05798820980',
          },
          items: [
            {
              id: '17628924',
              productId: '280089',
              name: 'Refrigerante 600ml',
              unit: 'UNIT',
              quantity: 1,
              unitPrice: { value: 5, currency: 'BRL' },
              totalPrice: { value: 5, currency: 'BRL' },
            },
          ],
          payments: {
            pending: 0,
            prepaid: 0,
            methods: [],
          },
          total: {
            itemsPrice: { value: 5, currency: 'BRL' },
            otherFees: { value: 3, currency: 'BRL' },
            discount: { value: 2, currency: 'BRL' },
            addition: { value: 1, currency: 'BRL' },
            orderAmount: { value: 7, currency: 'BRL' },
          },
          takeout: {
            mode: 'DEFAULT',
            takeoutMinutes: 25,
            takeoutDateTime: '2023-02-07 07:31:46',
          },
        },
      }

      const licensee = licenseeFactory.build()

      const pedidos10 = new Pedidos10(licensee)
      await pedidos10.processOrder(body)

      expect(orderLoadFnSpy).toHaveBeenCalledWith()
      expect(orderSaveFnSpy).toHaveBeenCalledWith()
    })
  })

  describe('#sendOrder', () => {
    describe('when the licensee has no integrator configuration', () => {
      it('changes integration_status to done', async () => {
        const licensee = await Licensee.create(licenseeFactory.build({ pedidos10_integrator: '' }))
        const order = await createOrder({ ...orderFactory.build({ licensee, integration_status: 'pending' }) })

        const pedidos10 = new Pedidos10(licensee)
        const orderChanged = await pedidos10.sendOrder(order)

        expect(orderChanged.integration_status).toEqual('done')
      })
    })

    describe('when an error occurs', () => {
      it('changes the integration_status to done and fills the error', async () => {
        const licensee = licenseeFactory.build({ pedidos10_integrator: 'error' })
        const order = orderFactory.build({ licensee, integration_status: 'pending' })

        const pedidos10 = new Pedidos10(licensee)
        const orderUpdated = await pedidos10.sendOrder(order)

        expect(orderUpdated.integration_status).toEqual('error')
        expect(orderUpdated.integration_error).toEqual('Error: implementar quando tiver o primeiro integrador')
      })
    })
  })
})
