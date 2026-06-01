import { OrdersController } from './OrdersController'

function buildResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  }
}

function buildController() {
  const receivePedidos10Order = { execute: jest.fn() }
  const changePedidos10OrderStatus = { execute: jest.fn() }
  const controller = new OrdersController({ receivePedidos10Order, changePedidos10OrderStatus })
  return { controller, receivePedidos10Order, changePedidos10OrderStatus }
}

describe('OrdersController delegation', () => {
  it('delegates create to receivePedidos10Order and returns status 202', async () => {
    const { controller, receivePedidos10Order } = buildController()
    const bodySaved = { _id: 'body-id' }
    receivePedidos10Order.execute.mockResolvedValue(bodySaved)

    const req = {
      licensee: { _id: 'licensee-id' },
      body: { MerchantExternalCode: 'merchant-code', order: { id: 'order-id' } },
    }
    const res = buildResponse()

    await controller.create(req, res)

    expect(receivePedidos10Order.execute).toHaveBeenCalledWith({
      licenseeId: 'licensee-id',
      MerchantExternalCode: 'merchant-code',
      order: { id: 'order-id' },
    })
    expect(res.status).toHaveBeenCalledWith(202)
    expect(res.send).toHaveBeenCalledWith({ id: 'body-id' })
  })

  it('delegates changeStatus to changePedidos10OrderStatus and returns status 200', async () => {
    const { controller, changePedidos10OrderStatus } = buildController()
    const bodySaved = { _id: 'body-id' }
    changePedidos10OrderStatus.execute.mockResolvedValue(bodySaved)

    const req = { licensee: { _id: 'licensee-id' }, body: { order: 'order-id', status: 'delivered' } }
    const res = buildResponse()

    await controller.changeStatus(req, res)

    expect(changePedidos10OrderStatus.execute).toHaveBeenCalledWith({
      licenseeId: 'licensee-id',
      order: 'order-id',
      status: 'delivered',
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ id: 'body-id' })
  })
})
