const Licensee = require('@models/Licensee')
const { createOrder, getOrderBy } = require('@repositories/order')
const mongoServer = require('../../../../../.jest/utils')
const Order = require('./Order')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { order: orderFactory } = require('@factories/order')

describe('Pedidos10/Order', () => {
  beforeAll(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterAll(async () => {
    await mongoServer.disconnect()
  })

  describe('#loadOrderFromDatabase', () => {
    describe('when does not exists', () => {
      it('does not load', async () => {
        const licensee = await Licensee.create(licenseeFactory.build())

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

        const order = new Order(body, licensee)
        await order.loadOrderFromDatabase()

        expect(order.alreadyExists()).toEqual(false)
      })
    })

    describe('when already exists', () => {
      it('loads the order from database', async () => {
        const licensee = await Licensee.create(licenseeFactory.build())
        await createOrder({ ...orderFactory.build({ licensee }) })

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

        const order = new Order(body, licensee)
        await order.loadOrderFromDatabase()

        expect(order.alreadyExists()).toEqual(true)
      })
    })
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
        const order = new Order(body, licensee)
        await order.save()

        const orderPersisted = await getOrderBy({ licensee: licensee, order_external_id: '9967816' })

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
          await createOrder({ ...orderFactory.build({ licensee }) })

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

          const order = new Order(body, licensee)
          await order.loadOrderFromDatabase()
          await order.save()

          const orderUpdated = await getOrderBy({ licensee, order_external_id: '9967816' })

          expect(orderUpdated.status).toEqual('CHANGED_STATUS')
        })

        it('changes integration_status to pending', async () => {
          const licensee = await Licensee.create(licenseeFactory.build())
          await createOrder({ ...orderFactory.build({ licensee }), integration_status: 'done' })

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

          const order = new Order(body, licensee)
          await order.loadOrderFromDatabase()
          await order.save()

          const orderUpdated = await getOrderBy({ licensee, order_external_id: '9967816' })

          expect(orderUpdated.integration_status).toEqual('pending')
        })
      })

      describe('when the status is equal than the persisted order', () => {
        it('update fields', async () => {
          const licensee = await Licensee.create(licenseeFactory.build())
          await createOrder({ ...orderFactory.build({ licensee }), integration_status: 'done' })

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

          const order = new Order(body, licensee)
          await order.loadOrderFromDatabase()
          await order.save()

          const orderUpdated = await getOrderBy({ licensee, order_external_id: '9967816' })

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
          await createOrder({ ...orderFactory.build({ licensee }), integration_status: 'done' })

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

          const order = new Order(body, licensee)
          await order.loadOrderFromDatabase()
          await order.save()

          const orderUpdated = await getOrderBy({ licensee, order_external_id: '9967816' })

          expect(orderUpdated.integration_status).toEqual('done')
        })
      })
    })
  })
})
