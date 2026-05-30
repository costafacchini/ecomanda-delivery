import { changeOrderStatus } from './Pedidos10ChangeOrderStatus'
import Licensee from '@models/Licensee'
import Body from '@models/Body'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { OrderRepositoryDatabase } from '@repositories/order'
import { licensee as licenseeFactory } from '@factories/licensee'
import { order as orderFactory } from '@factories/order'
import { body as bodyFactory } from '@factories/body'
import { Pedidos10 } from '../plugins/integrations/Pedidos10'
import { IntegratorBase } from '../plugins/integrations/IntegratorBase'
import { createRuntimeDependencies } from '../runtime/dependencies'

let dependencies

describe('changeOrderStatus', () => {
  const pedidos10ChangeOrderStatusFnSpy = jest
    .spyOn(Pedidos10.prototype, 'changeOrderStatus')
    .mockImplementation(() => {})

  jest.spyOn(IntegratorBase.prototype, 'parseStatus').mockImplementation((status) => {
    return status
  })

  beforeEach(() => {
    installMemoryRepositories()
    dependencies = createRuntimeDependencies()
    jest.clearAllMocks()
  })

  afterEach(() => {
    resetMemoryRepositories()
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

    await changeOrderStatus(data, dependencies)

    expect(pedidos10ChangeOrderStatusFnSpy).toHaveBeenCalledWith(order.id, 'delivered')
  })
})
