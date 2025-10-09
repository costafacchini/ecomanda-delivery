import processWebhook from './Pedidos10Webhook.js'
import Licensee from '@models/Licensee.js'
import Body from '@models/Body.js'
import mongoServer from '.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { body as bodyFactory   } from '@factories/body.js'
import Pedidos10 from '../plugins/integrations/Pedidos10.js'

describe('processWebhook', () => {
  const pedidos10ProcessOrderFnSpy = jest.spyOn(Pedidos10.prototype, 'processOrder')

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds a job to send order', async () => {
    const licensee = await Licensee.create(licenseeFactory.build())
    const body = await Body.create(
      bodyFactory.build({
        kind: 'pedidos10',
        content: {
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
        },
        licensee,
      }),
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await processWebhook(data)

    expect(pedidos10ProcessOrderFnSpy).toHaveBeenCalledWith(body.content)

    expect(actions.length).toEqual(1)
    expect(actions[0].action).toEqual('integration-send-order')
    expect(actions[0].body.orderId).toBeDefined()
  })
})
