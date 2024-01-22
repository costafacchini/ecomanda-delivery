const sendOrder = require('./Pedidos10SendOrder')
const Licensee = require('@models/Licensee')
const mongoServer = require('.jest/utils')
const { createOrder } = require('@repositories/order')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { order: orderFactory } = require('@factories/order')
const Pedidos10 = require('../plugins/integrations/Pedidos10')

describe('sendOrder', () => {
  const pedidos10SendOrderFnSpy = jest.spyOn(Pedidos10.prototype, 'sendOrder')

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

    const data = {
      orderId: order._id,
    }

    await sendOrder(data)

    expect(pedidos10SendOrderFnSpy).toHaveBeenCalled()
  })
})
