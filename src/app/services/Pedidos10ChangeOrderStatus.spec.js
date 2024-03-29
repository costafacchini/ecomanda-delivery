const changeOrderStatus = require('./Pedidos10ChangeOrderStatus')
const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const mongoServer = require('.jest/utils')
const { OrderRepositoryDatabase } = require('@repositories/order')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { order: orderFactory } = require('@factories/order')
const { body: bodyFactory } = require('@factories/body')
const Pedidos10 = require('../plugins/integrations/Pedidos10')
const IntegratorBase = require('../plugins/integrations/IntegratorBase')

describe('changeOrderStatus', () => {
  const pedidos10ChangeOrderStatusFnSpy = jest
    .spyOn(Pedidos10.prototype, 'changeOrderStatus')
    .mockImplementation(() => {})

  jest.spyOn(IntegratorBase.prototype, 'parseStatus').mockImplementation((status) => {
    return status
  })

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds send order to integrator', async () => {
    const licensee = await Licensee.create(licenseeFactory.build())

    const orderRepository = new OrderRepositoryDatabase()
    const order = await orderRepository.create({ ...orderFactory.build({ licensee }) })

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
