import { IntegrationsController } from './IntegrationsController.js'

function buildResponse() {
  return {
    sendStatus: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const bodyRepository = { create: jest.fn() }
  const publishMessage = jest.fn()

  const controller = new IntegrationsController({ bodyRepository, publishMessage })

  return { controller, bodyRepository, publishMessage }
}

describe('IntegrationsController delegation', () => {
  it('creates a body and publishes process-webhook-request, then returns 200', async () => {
    const { controller, bodyRepository, publishMessage } = buildController()
    const bodySaved = { _id: 'body-id' }
    bodyRepository.create.mockResolvedValue(bodySaved)

    const req = {
      body: { kind: 'get-pix', payload: { cart_id: 'cart-id' } },
      query: { provider: 'pagarme' },
      licensee: { _id: 'licensee-id' },
    }
    const res = buildResponse()

    await controller.create(req, res)

    expect(bodyRepository.create).toHaveBeenCalledWith({
      content: { kind: 'get-pix', payload: { cart_id: 'cart-id' }, provider: 'pagarme' },
      licensee: 'licensee-id',
      kind: 'webhook',
    })
    expect(publishMessage).toHaveBeenCalledWith({ key: 'process-webhook-request', body: { bodyId: 'body-id' } })
    expect(res.sendStatus).toHaveBeenCalledWith(200)
  })
})
