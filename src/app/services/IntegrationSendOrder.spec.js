const sendOrder = require('./IntegrationSendOrder')
const Licensee = require('@models/Licensee')
const mongoServer = require('.jest/utils')
const { createOrder } = require('@repositories/order')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { order: orderFactory } = require('@factories/order')
const IntegratorBase = require('../plugins/integrations/IntegratorBase')
const { getOrderBy } = require('@repositories/order')

describe('sendOrder', () => {
  const integratorSendOrderFnSpy = jest.spyOn(IntegratorBase.prototype, 'sendOrder')

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('sends order to integrator', async () => {
    const licensee = await Licensee.create(licenseeFactory.build())
    const order = await createOrder({ ...orderFactory.build({ licensee }) })

    const data = {
      orderId: order._id,
    }

    await sendOrder(data)

    expect(integratorSendOrderFnSpy).toHaveBeenCalled()
  })

  describe('when success', () => {
    it('change order status to done', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const order = await createOrder({ ...orderFactory.build({ licensee, integration_status: 'pending' }) })

      const data = {
        orderId: order._id,
      }

      await sendOrder(data)

      const orderUpdated = await getOrderBy(order._id)
      expect(orderUpdated.integration_status).toEqual('done')
    })
  })

  describe('when an error occurs', () => {
    it('changes the integration_status to done and fills the error', async () => {
      const integratorSendOrderErrorSpy = jest.spyOn(IntegratorBase.prototype, 'sendOrder').mockImplementation(() => {
        throw new Error('some error')
      })

      const licensee = await Licensee.create(licenseeFactory.build())
      const order = await createOrder({ ...orderFactory.build({ licensee, integration_status: 'pending' }) })

      const data = {
        orderId: order._id,
      }

      await sendOrder(data)

      const orderUpdated = await getOrderBy(order._id)
      expect(orderUpdated.integration_status).toEqual('error')
      expect(orderUpdated.integration_error).toEqual('Error: some error')

      integratorSendOrderErrorSpy.mockRestore()
    })
  })
})
