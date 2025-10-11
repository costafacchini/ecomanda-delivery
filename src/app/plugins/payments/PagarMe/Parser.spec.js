import Parser from './Parser'

describe('PagarMe/Parser plugin', () => {
  describe('#parseOrderPaidEvent', () => {
    describe('when valid', () => {
      it('response a value object with only important order fields', () => {
        const body = {
          id: 'hook_RyEKQO789TRpZjv5',
          account: {
            id: 'acc_jZkdN857et650oNv',
            name: 'Lojinha',
          },
          type: 'order.paid',
          created_at: '2017-06-29T20:23:47',
          data: {
            id: 'or_ZdnB5BBCmYhk534R',
            code: '1303724',
            amount: 12356,
            currency: 'BRL',
            closed: true,
            items: [
              {
                id: 'oi_EqnMMrbFgBf0MaN1',
                description: 'Produto',
                amount: 10166,
                quantity: 1,
                status: 'active',
                created_at: '2022-06-29T20:23:42',
                updated_at: '2022-06-29T20:23:42',
              },
            ],
            customer: {
              id: 'cus_oy23JRQCM1cvzlmD',
              name: 'FABIO ',
              email: 'abc@teste.com',
              document: '09006068709',
              type: 'individual',
              delinquent: false,
              created_at: '2022-06-29T20:23:42',
              updated_at: '2022-06-29T20:23:42',
              phones: {},
            },
            shipping: {
              amount: 2190,
              description: 'Economico',
              address: {
                zip_code: '90265',
                city: 'Malibu',
                state: 'CA',
                country: 'US',
                line_1: '10880, Malibu Point, Malibu Central',
              },
            },
            status: 'paid',
            created_at: '2022-06-29T20:23:42',
            updated_at: '2022-06-29T20:23:47',
            closed_at: '2022-06-29T20:23:44',
            charges: [
              {
                id: 'ch_d22356Jf4WuGr8no',
                code: '1303624',
                gateway_id: 'da7f2304-1937-42a4-b995-0f4ea2b36264',
                amount: 12356,
                status: 'paid',
                currency: 'BRL',
                payment_method: 'credit_card',
                paid_at: '2022-06-29T20:23:47',
                created_at: '2022-06-29T20:23:42',
                updated_at: '2022-06-29T20:23:47',
                customer: {
                  id: 'cus_oybzJRQ231cvzlmD',
                  name: 'FABIO E RACHEL ',
                  email: 'fabiomello11@gmail.com',
                  document: '09006507709',
                  type: 'individual',
                  delinquent: false,
                  created_at: '2022-06-29T20:23:42',
                  updated_at: '2022-06-29T20:23:42',
                  phones: {},
                },
                last_transaction: {
                  id: 'tran_opAqDj2390S1lKQO',
                  transaction_type: 'credit_card',
                  gateway_id: '3b12320a-0d67-4c06-b497-6622fe9763c8',
                  amount: 12356,
                  status: 'captured',
                  success: true,
                  installments: 2,
                  acquirer_name: 'redecard',
                  acquirer_affiliation_code: '30233726',
                  acquirer_tid: '247391236',
                  acquirer_nsu: '247391236',
                  acquirer_auth_code: '236689',
                  operation_type: 'capture',
                  card: {
                    id: 'card_BjKOmahgAf0D23lw',
                    last_four_digits: '4485',
                    brand: 'Visa',
                    holder_name: 'FABIO',
                    exp_month: 6,
                    exp_year: 2025,
                    status: 'active',
                    created_at: '2022-06-29T20:23:42',
                    updated_at: '2022-06-29T20:23:42',
                    billing_address: {
                      zip_code: '90265',
                      city: 'Malibu',
                      state: 'CA',
                      country: 'US',
                      line_1: '10880, Malibu Point, Malibu Central',
                    },
                    type: 'credit',
                  },
                  created_at: '2022-06-29T20:23:47',
                  updated_at: '2022-06-29T20:23:47',
                  gateway_response: {
                    code: '200',
                  },
                },
              },
            ],
          },
        }

        const parser = new Parser()
        const event = parser.parseOrderPaidEvent(body)

        expect(event.id).toEqual('or_ZdnB5BBCmYhk534R')
        expect(event.status).toEqual('paid')
        expect(event.payment_status).toEqual('paid')
        expect(event.charge_id).toEqual('ch_d22356Jf4WuGr8no')
      })
    })

    describe('when body has no data', () => {
      it('response a value object with fields empty', () => {
        const body = {
          field: '1',
          other: '2',
        }

        const parser = new Parser()
        const event = parser.parseOrderPaidEvent(body)

        expect(event.id).toEqual('')
        expect(event.status).toEqual('')
        expect(event.payment_status).toEqual('')
        expect(event.charge_id).toEqual('')
      })
    })

    describe('when body has no charges', () => {
      it('response a value object with fields empty', () => {
        const body = {
          data: {
            test: '1',
          },
          other: '2',
        }

        const parser = new Parser()
        const event = parser.parseOrderPaidEvent(body)

        expect(event.id).toEqual('')
        expect(event.status).toEqual('')
        expect(event.payment_status).toEqual('')
        expect(event.charge_id).toEqual('')
      })
    })
  })
})
