import Parser from './Parser'

describe('Pedidos10/Parser', () => {
  describe('#parseOrder', () => {
    describe('when valid', () => {
      it('response a value object with only important order fields', () => {
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

        const parser = new Parser()
        const order = parser.parseOrder(body)

        expect(order.merchant_external_code).toEqual('358b9068-34cf-4f96-b883-0d8192bc12dd')
        expect(order.order_external_id).toEqual('9967816')
        expect(order.type).toEqual('TAKEOUT')
        expect(order.display_id).toEqual('1#9967816')
        expect(order.status).toEqual('CONFIRMED')
        expect(order.customer_information.id).toEqual('14246')
        expect(order.customer_information.name).toEqual('Anderson Felizari')
        expect(order.customer_information.phone).toEqual('47988044298')
        expect(order.customer_information.document).toEqual('05798820980')
        expect(order.total_items).toEqual(5)
        expect(order.total_fees).toEqual(3)
        expect(order.total_discount).toEqual(2)
        expect(order.total_addition).toEqual(1)
        expect(order.total).toEqual(7)
        expect(order.payments.pending).toEqual(7)
        expect(order.payments.prepaid).toEqual(0)
        expect(order.payments.methods[0].value).toEqual(7)
        expect(order.payments.methods[0].type).toEqual('PENDING')
        expect(order.payments.methods[0].method).toEqual('CASH')
        expect(order.takeout.mode).toEqual('DEFAULT')
        expect(order.takeout.takeout_minutes).toEqual(25)
        expect(order.items[0].id).toEqual('17628924')
        expect(order.items[0].product_id).toEqual('280089')
        expect(order.items[0].name).toEqual('Refrigerante 600ml')
        expect(order.items[0].unit).toEqual('UNIT')
        expect(order.items[0].description).toEqual('Coca-Cola')
        expect(order.items[0].quantity).toEqual(1)
        expect(order.items[0].unit_price).toEqual(5)
        expect(order.items[0].total_price).toEqual(5)
        expect(order.items[0].option_groups[0].id).toEqual('27652021')
        expect(order.items[0].option_groups[0].group_id).toEqual('I392901')
        expect(order.items[0].option_groups[0].name).toEqual('Bebida')
        expect(order.items[0].option_groups[0].define_value).toEqual(true)
        expect(order.items[0].option_groups[0].options[0].id).toEqual('52007400')
        expect(order.items[0].option_groups[0].options[0].option_id).toEqual('I981750')
        expect(order.items[0].option_groups[0].options[0].name).toEqual('Coca-Cola')
        expect(order.items[0].option_groups[0].options[0].unit).toEqual('UNIT')
        expect(order.items[0].option_groups[0].options[0].quantity).toEqual(1)
        expect(order.items[0].option_groups[0].options[0].total).toEqual(5)
      })
    })

    describe('when body has any order', () => {
      it('response a value object with fields empty', () => {
        const body = {
          field: '1',
          other: '2',
        }

        const parser = new Parser()
        const order = parser.parseOrder(body)

        expect(order.merchant_external_code).toEqual('')
        expect(order.order_external_id).toEqual('')
        expect(order.type).toEqual('')
        expect(order.display_id).toEqual('')
        expect(order.status).toEqual('')
        expect(order.customer_information.id).toEqual('')
        expect(order.customer_information.name).toEqual('')
        expect(order.customer_information.phone).toEqual('')
        expect(order.customer_information.document).toEqual('')
        expect(order.total_items).toEqual(0)
        expect(order.total_fees).toEqual(0)
        expect(order.total_discount).toEqual(0)
        expect(order.total_addition).toEqual(0)
        expect(order.total).toEqual(0)
        expect(order.payments.pending).toEqual(0)
        expect(order.payments.prepaid).toEqual(0)
        expect(order.payments.methods).toEqual([])
        expect(order.takeout.mode).toEqual('')
        expect(order.takeout.takeout_minutes).toEqual(0)
        expect(order.items).toEqual([])
      })
    })
  })
})
