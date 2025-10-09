import mongoServer from '../../../../.jest/utils.js'
import Pedidos10 from './Pedidos10.js'
import Order from './Pedidos10/Order.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'

describe('Pedidos10 plugin', () => {
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

      expect(orderSaveFnSpy).toHaveBeenCalledWith(body)
    })
  })

  describe('#signOrderWebhook', () => {
    it('calls the order module to sign order webhook', async () => {
      const signOrderWebhookFnSpy = jest.spyOn(Order.prototype, 'signOrderWebhook').mockImplementation(() => {})

      const licensee = licenseeFactory.build()
      licensee.pedidos10_integration = {
        access_token: 'access-token',
      }

      const pedidos10 = new Pedidos10(licensee)
      await pedidos10.signOrderWebhook()

      expect(signOrderWebhookFnSpy).toHaveBeenCalled()

      signOrderWebhookFnSpy.mockRestore()
    })
  })

  describe('#changeOrderStatus', () => {
    it('calls the order module to change order status', async () => {
      const changeOrderStatusFnSpy = jest.spyOn(Order.prototype, 'changeOrderStatus').mockImplementation(() => {})

      const licensee = licenseeFactory.build()
      licensee.pedidos10_integration = {
        access_token: 'access-token',
      }

      const pedidos10 = new Pedidos10(licensee)
      await pedidos10.changeOrderStatus()

      expect(changeOrderStatusFnSpy).toHaveBeenCalled()

      changeOrderStatusFnSpy.mockRestore()
    })
  })
})
