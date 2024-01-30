const changeOrderStatus = require('./Pedidos10ChangeOrderStatus')
const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const mongoServer = require('.jest/utils')
const { createOrder } = require('@repositories/order')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { order: orderFactory } = require('@factories/order')
const { body: bodyFactory } = require('@factories/body')
const Pedidos10 = require('../plugins/integrations/Pedidos10')

describe('changeOrderStatus', () => {
  const pedidos10ChangeOrderStatusFnSpy = jest
    .spyOn(Pedidos10.prototype, 'changeOrderStatus')
    .mockImplementation(() => {})

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds send order to integrator', async () => {
    const licensee = await Licensee.create(licenseeFactory.build())
    const order = await createOrder({ ...orderFactory.build({ licensee }) })

    const body = await Body.create(
      bodyFactory.build({
        kind: 'pedidos10',
        content: {
          order: order.id,
          status: 'delivered',
        },
        licensee,
      }),
    )

    const data = {
      bodyId: body._id,
    }

    await changeOrderStatus(data)

    expect(pedidos10ChangeOrderStatusFnSpy).toHaveBeenCalledWith(order.id, 'delivered')
  })
})
