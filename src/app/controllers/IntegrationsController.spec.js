import { BodyRepositoryMemory } from '@repositories/body'
import { IntegrationsController } from './IntegrationsController.js'

function buildResponse() {
  return {
    sendStatus: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const bodyRepository = new BodyRepositoryMemory()
  const publishMessage = jest.fn()

  const controller = new IntegrationsController({ bodyRepository, publishMessage })

  return { controller, bodyRepository, publishMessage }
}

describe('IntegrationsController delegation', () => {
  it('creates a body and publishes process-webhook-request, then returns 200', async () => {
    const { controller, bodyRepository, publishMessage } = buildController()

    const req = {
      body: { kind: 'get-pix', payload: { cart_id: 'cart-id' } },
      query: { provider: 'pagarme' },
      licensee: { _id: 'licensee-id' },
    }
    const res = buildResponse()

    await controller.create(req, res)

    const bodies = await bodyRepository.find({ licensee: 'licensee-id' })
    const createdBody = bodies[0]

    expect(publishMessage).toHaveBeenCalledWith({ key: 'process-webhook-request', body: { bodyId: createdBody._id } })
    expect(res.sendStatus).toHaveBeenCalledWith(200)
  })
})
