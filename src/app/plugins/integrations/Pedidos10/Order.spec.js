import Licensee from '@models/Licensee.js'
import { OrderRepositoryDatabase  } from '@repositories/order.js'
import mongoServer from '../../../../../.jest/utils.js'
import Order from './Order.js'
import Webhook from './services/Webhook.js'
import OrderStatus from './services/OrderStatus.js'
import Auth from './services/Auth.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { order as orderFactory   } from '@factories/order.js'

describe('Pedidos10/Order', () => {
  beforeAll(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('#save', () => {
    describe('when order does not exists', () => {
      it('saves the order', async () => {
        const body = {
          MerchantExternalCode: '358b9068-34cf-4f96-b883-0d8192bc12dd',
          order: {
            id: '9967816',
            type: 'TAKEOUT',
            displayId: '1#9967816',
            status: 'CONFIRMED',
            createdAt: '2023-02-07 07:31:46',
            orderTiming: 'INSTANT',
            preparationStartDateTime: '2023-02-07 07:31:46',
            merchant: {
              id: '057.988.209-80-fb34b0ab284040d1f8cd52b9883c4e6c',
              name: 'Estabelecimento Teste',
            },
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
                categoryName: 'Bebidas',
                externalCode: null,
                unit: 'UNIT',
                quantity: 1,
                specialInstructions: '',
                completeDescription: 'Coca-Cola',
                unitPrice: { value: 5, currency: 'BRL' },
                totalPrice: { value: 5, currency: 'BRL' },
                optionGroups: [
                  {
                    id: '27652021',
                    optionGroupId: 'I392901',
                    name: 'Bebida',
                    defineValue: true,
                    options: [
                      {
                        id: '52007400',
                        optionGroupOptionId: 'I981750',
                        name: 'Coca-Cola',
                        unit: 'UNIT',
                        quantity: 1,
                        totalPrice: { value: 5, currency: 'BRL' },
                        specialInstructions: '',
                      },
                    ],
                  },
                ],
              },
            ],
            otherFees: [
              {
                type: 'DELIVERY_FEE',
                receivedBy: 'MERCHANT',
                price: { value: 0, currency: 'BRL' },
              },
            ],
            discounts: [],
            total: {
              itemsPrice: { value: 5, currency: 'BRL' },
              otherFees: { value: 3, currency: 'BRL' },
              discount: { value: 2, currency: 'BRL' },
              addition: { value: 1, currency: 'BRL' },
              orderAmount: { value: 7, currency: 'BRL' },
            },
            payments: {
              prepaid: 0,
              pending: 7,
              methods: [
                {
                  value: 7,
                  currency: 'BRL',
                  type: 'PENDING',
                  method: 'CASH',
                  methodInfo: null,
                  changeFor: null,
                },
              ],
            },
            delivery: null,
            takeout: {
              mode: 'DEFAULT',
              takeoutMinutes: 25,
              takeoutDateTime: '2023-02-07 07:31:46',
            },
            origin: 'marketplace',
            extraInfo: '1#9967816 - Pedidos10 Marketplace',
          },
        }

        const licensee = await Licensee.create(licenseeFactory.build())
        const order = new Order(licensee)
        await order.save(body)

        const orderRepository = new OrderRepositoryDatabase()
        const orderPersisted = await orderRepository.findFirst({ licensee: licensee, order_external_id: '9967816' })

        expect(orderPersisted.merchant_external_code).toEqual('358b9068-34cf-4f96-b883-0d8192bc12dd')
        expect(orderPersisted.order_external_id).toEqual('9967816')
        expect(orderPersisted.type).toEqual('TAKEOUT')
        expect(orderPersisted.display_id).toEqual('1#9967816')
        expect(orderPersisted.status).toEqual('CONFIRMED')
        expect(orderPersisted.customer_information.id).toEqual('14246')
        expect(orderPersisted.customer_information.name).toEqual('Anderson Felizari')
        expect(orderPersisted.customer_information.phone).toEqual('47988044298')
        expect(orderPersisted.customer_information.document).toEqual('05798820980')
        expect(orderPersisted.total_items).toEqual(5)
        expect(orderPersisted.total_fees).toEqual(3)
        expect(orderPersisted.total_discount).toEqual(2)
        expect(orderPersisted.total_addition).toEqual(1)
        expect(orderPersisted.total).toEqual(7)
        expect(orderPersisted.payments.pending).toEqual(7)
        expect(orderPersisted.payments.prepaid).toEqual(0)
        expect(orderPersisted.payments.methods[0].value).toEqual(7)
        expect(orderPersisted.payments.methods[0].type).toEqual('PENDING')
        expect(orderPersisted.payments.methods[0].method).toEqual('CASH')
        expect(orderPersisted.takeout.mode).toEqual('DEFAULT')
        expect(orderPersisted.takeout.takeout_minutes).toEqual(25)
        expect(orderPersisted.items[0].id).toEqual('17628924')
        expect(orderPersisted.items[0].product_id).toEqual('280089')
        expect(orderPersisted.items[0].name).toEqual('Refrigerante 600ml')
        expect(orderPersisted.items[0].unit).toEqual('UNIT')
        expect(orderPersisted.items[0].description).toEqual('Coca-Cola')
        expect(orderPersisted.items[0].quantity).toEqual(1)
        expect(orderPersisted.items[0].unit_price).toEqual(5)
        expect(orderPersisted.items[0].total_price).toEqual(5)
        expect(orderPersisted.items[0].option_groups[0].id).toEqual('27652021')
        expect(orderPersisted.items[0].option_groups[0].group_id).toEqual('I392901')
        expect(orderPersisted.items[0].option_groups[0].name).toEqual('Bebida')
        expect(orderPersisted.items[0].option_groups[0].define_value).toEqual(true)
        expect(orderPersisted.items[0].option_groups[0].options[0].id).toEqual('52007400')
        expect(orderPersisted.items[0].option_groups[0].options[0].option_id).toEqual('I981750')
        expect(orderPersisted.items[0].option_groups[0].options[0].name).toEqual('Coca-Cola')
        expect(orderPersisted.items[0].option_groups[0].options[0].unit).toEqual('UNIT')
        expect(orderPersisted.items[0].option_groups[0].options[0].quantity).toEqual(1)
        expect(orderPersisted.items[0].option_groups[0].options[0].total).toEqual(5)
      })
    })

    describe('when order exists', () => {
      describe('when status is different than the persisted order', () => {
        it('updates the order status', async () => {
          const licensee = await Licensee.create(licenseeFactory.build())

          const orderRepository = new OrderRepositoryDatabase()
          await orderRepository.create({ ...orderFactory.build({ licensee }) })

          const body = {
            MerchantExternalCode: '358b9068-34cf-4f96-b883-0d8192bc12dd',
            order: {
              id: '9967816',
              status: 'CHANGED_STATUS',
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
                  optionGroups: [],
                },
              ],
              total: {
                itemsPrice: { value: 5, currency: 'BRL' },
                otherFees: { value: 3, currency: 'BRL' },
                discount: { value: 2, currency: 'BRL' },
                addition: { value: 1, currency: 'BRL' },
                orderAmount: { value: 7, currency: 'BRL' },
              },
              payments: {
                prepaid: 0,
                pending: 7,
                methods: [],
              },
              takeout: {
                mode: 'DEFAULT',
                takeoutMinutes: 25,
                takeoutDateTime: '2023-02-07 07:31:46',
              },
            },
          }

          const order = new Order(licensee)
          await order.save(body)

          const orderUpdated = await orderRepository.findFirst({ licensee, order_external_id: '9967816' })

          expect(orderUpdated.status).toEqual('CHANGED_STATUS')
        })

        it('changes integration_status to pending', async () => {
          const licensee = await Licensee.create(licenseeFactory.build())

          const orderRepository = new OrderRepositoryDatabase()
          await orderRepository.create({ ...orderFactory.build({ licensee }), integration_status: 'done' })

          const body = {
            MerchantExternalCode: '358b9068-34cf-4f96-b883-0d8192bc12dd',
            order: {
              id: '9967816',
              status: 'CHANGED_STATUS',
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
                  optionGroups: [],
                },
              ],
              total: {
                itemsPrice: { value: 5, currency: 'BRL' },
                otherFees: { value: 3, currency: 'BRL' },
                discount: { value: 2, currency: 'BRL' },
                addition: { value: 1, currency: 'BRL' },
                orderAmount: { value: 7, currency: 'BRL' },
              },
              payments: {
                prepaid: 0,
                pending: 7,
                methods: [],
              },
              takeout: {
                mode: 'DEFAULT',
                takeoutMinutes: 25,
                takeoutDateTime: '2023-02-07 07:31:46',
              },
            },
          }

          const order = new Order(licensee)
          await order.save(body)

          const orderUpdated = await orderRepository.findFirst({ licensee, order_external_id: '9967816' })

          expect(orderUpdated.integration_status).toEqual('pending')
        })
      })

      describe('when the status is equal than the persisted order', () => {
        it('update fields', async () => {
          const licensee = await Licensee.create(licenseeFactory.build())

          const orderRepository = new OrderRepositoryDatabase()
          await orderRepository.create({ ...orderFactory.build({ licensee }), integration_status: 'done' })

          const body = {
            MerchantExternalCode: '358b9068-34cf-4f96-b883-0d8192bc12dd',
            order: {
              id: '9967816',
              status: 'CONFIRMED',
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
                  optionGroups: [],
                },
                {
                  id: '17628924',
                  productId: '280090',
                  name: 'Refrigerante Lata',
                  unit: 'UNIT',
                  quantity: 1,
                  unitPrice: { value: 4, currency: 'BRL' },
                  totalPrice: { value: 4, currency: 'BRL' },
                  optionGroups: [],
                },
              ],
              total: {
                itemsPrice: { value: 9, currency: 'BRL' },
                otherFees: { value: 1, currency: 'BRL' },
                discount: { value: 1, currency: 'BRL' },
                addition: { value: 2, currency: 'BRL' },
                orderAmount: { value: 11, currency: 'BRL' },
              },
              payments: {
                prepaid: 0,
                pending: 11,
                methods: [],
              },
              takeout: {
                mode: 'DEFAULT',
                takeoutMinutes: 25,
                takeoutDateTime: '2023-02-07 07:31:46',
              },
            },
          }

          const order = new Order(licensee)
          await order.save(body)

          const orderUpdated = await orderRepository.findFirst({ licensee, order_external_id: '9967816' })

          expect(orderUpdated.items.length).toEqual(2)
          expect(orderUpdated.payments.pending).toEqual(11)
          expect(orderUpdated.total_items).toEqual(9)
          expect(orderUpdated.total_fees).toEqual(1)
          expect(orderUpdated.total_discount).toEqual(1)
          expect(orderUpdated.total_addition).toEqual(2)
          expect(orderUpdated.total).toEqual(11)
        })

        it('does not change integration_status', async () => {
          const licensee = await Licensee.create(licenseeFactory.build())
          const orderRepository = new OrderRepositoryDatabase()
          await orderRepository.create({ ...orderFactory.build({ licensee }), integration_status: 'done' })

          const body = {
            MerchantExternalCode: '358b9068-34cf-4f96-b883-0d8192bc12dd',
            order: {
              id: '9967816',
              status: 'CONFIRMED',
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
                  optionGroups: [],
                },
              ],
              total: {
                itemsPrice: { value: 5, currency: 'BRL' },
                otherFees: { value: 3, currency: 'BRL' },
                discount: { value: 2, currency: 'BRL' },
                addition: { value: 1, currency: 'BRL' },
                orderAmount: { value: 7, currency: 'BRL' },
              },
              payments: {
                prepaid: 0,
                pending: 7,
                methods: [],
              },
              takeout: {
                mode: 'DEFAULT',
                takeoutMinutes: 25,
                takeoutDateTime: '2023-02-07 07:31:46',
              },
            },
          }

          const order = new Order(licensee)
          await order.save(body)

          const orderUpdated = await orderRepository.findFirst({ licensee, order_external_id: '9967816' })

          expect(orderUpdated.integration_status).toEqual('done')
        })
      })
    })
  })

  describe('#signOrderWebhook', () => {
    it('calls service to sign order webhooks on Pedidos 10 API', async () => {
      const webhookSignFnSpy = jest.spyOn(Webhook.prototype, 'sign').mockImplementation(() => {})
      const authLoginFnSpy = jest.spyOn(Auth.prototype, 'login').mockImplementation(() => {})

      const licensee = licenseeFactory.build()
      licensee.pedidos10_integration = {
        authenticated: true,
      }

      const order = new Order(licensee)
      await order.signOrderWebhook()

      expect(authLoginFnSpy).not.toHaveBeenCalled()
      expect(webhookSignFnSpy).toHaveBeenCalled()

      authLoginFnSpy.mockRestore()
      webhookSignFnSpy.mockRestore()
    })

    describe('when not logged on Pedidos 10 API', () => {
      it('calls the login before on Pedidos 10 API', async () => {
        const webhookSignFnSpy = jest.spyOn(Webhook.prototype, 'sign').mockImplementation(() => {})
        const authLoginFnSpy = jest.spyOn(Auth.prototype, 'login').mockImplementation(() => {
          return true
        })

        const licensee = await Licensee.create(licenseeFactory.build())
        licensee.pedidos10_integration = {}

        const order = new Order(licensee)
        await order.signOrderWebhook()

        expect(authLoginFnSpy).toHaveBeenCalled()
        expect(webhookSignFnSpy).toHaveBeenCalled()

        authLoginFnSpy.mockRestore()
        webhookSignFnSpy.mockRestore()
      })
    })
  })

  describe('#changeOrderStatus', () => {
    it('calls service to change order status on Pedidos 10 API', async () => {
      const orderStatusChangeFnSpy = jest.spyOn(OrderStatus.prototype, 'change').mockImplementation(() => {})
      const authLoginFnSpy = jest.spyOn(Auth.prototype, 'login').mockImplementation(() => {})

      const licensee = licenseeFactory.build()
      licensee.pedidos10_integration = {
        authenticated: true,
      }

      const order = new Order(licensee)
      await order.changeOrderStatus('order-id', 'status')

      expect(authLoginFnSpy).not.toHaveBeenCalled()
      expect(orderStatusChangeFnSpy).toHaveBeenCalledWith('order-id', 'status')

      authLoginFnSpy.mockRestore()
      orderStatusChangeFnSpy.mockRestore()
    })

    describe('when not logged on Pedidos 10 API', () => {
      it('calls the login before on Pedidos 10 API', async () => {
        const orderStatusChangeFnSpy = jest.spyOn(OrderStatus.prototype, 'change').mockImplementation(() => {})
        const authLoginFnSpy = jest.spyOn(Auth.prototype, 'login').mockImplementation(() => {
          return true
        })

        const licensee = await Licensee.create(licenseeFactory.build())
        licensee.pedidos10_integration = {}

        const order = new Order(licensee)
        await order.changeOrderStatus('order-id', 'status')

        expect(authLoginFnSpy).toHaveBeenCalled()
        expect(orderStatusChangeFnSpy).toHaveBeenCalledWith('order-id', 'status')

        authLoginFnSpy.mockRestore()
        orderStatusChangeFnSpy.mockRestore()
      })
    })
  })
})
