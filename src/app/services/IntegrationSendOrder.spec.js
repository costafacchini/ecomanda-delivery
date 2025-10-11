import sendOrder from './IntegrationSendOrder'
import Licensee from '@models/Licensee'
import mongoServer from '.jest/utils'
import { OrderRepositoryDatabase } from '@repositories/order'
import { licensee as licenseeFactory } from '@factories/licensee'
import { order as orderFactory } from '@factories/order'
import IntegratorBase from '../plugins/integrations/IntegratorBase'

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

    const orderRepository = new OrderRepositoryDatabase()
    const order = await orderRepository.create({ ...orderFactory.build({ licensee }) })

    const data = {
      orderId: order._id,
    }

    await sendOrder(data)

    expect(integratorSendOrderFnSpy).toHaveBeenCalled()
  })

  describe('when success', () => {
    it('change order status to done', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      const orderRepository = new OrderRepositoryDatabase()
      const order = await orderRepository.create({ ...orderFactory.build({ licensee, integration_status: 'pending' }) })

      const data = {
        orderId: order._id,
      }

      await sendOrder(data)

      const orderUpdated = await orderRepository.findFirst({ _id: order._id })
      expect(orderUpdated.integration_status).toEqual('done')
    })
  })

  describe('when an error occurs', () => {
    it('changes the integration_status to done and fills the error', async () => {
      const integratorSendOrderErrorSpy = jest.spyOn(IntegratorBase.prototype, 'sendOrder').mockImplementation(() => {
        throw new Error('some error')
      })

      const licensee = await Licensee.create(licenseeFactory.build())

      const orderRepository = new OrderRepositoryDatabase()
      const order = await orderRepository.create({ ...orderFactory.build({ licensee, integration_status: 'pending' }) })

      const data = {
        orderId: order._id,
      }

      await sendOrder(data)

      const orderUpdated = await orderRepository.findFirst({ _id: order._id })
      expect(orderUpdated.integration_status).toEqual('error')
      expect(orderUpdated.integration_error).toEqual('Error: some error')

      integratorSendOrderErrorSpy.mockRestore()
    })
  })
})
