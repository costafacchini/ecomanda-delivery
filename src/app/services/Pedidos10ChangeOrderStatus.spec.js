import changeOrderStatus from './Pedidos10ChangeOrderStatus.js'
import Licensee from '@models/Licensee.js'
import Body from '@models/Body.js'
import mongoServer from '.jest/utils.js'
import { OrderRepositoryDatabase  } from '@repositories/order.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { order as orderFactory   } from '@factories/order.js'
import { body as bodyFactory   } from '@factories/body.js'
import Pedidos10 from '../plugins/integrations/Pedidos10.js'
import IntegratorBase from '../plugins/integrations/IntegratorBase.js'

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
