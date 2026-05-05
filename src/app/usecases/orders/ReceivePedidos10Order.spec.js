import { BodyRepositoryMemory } from '@repositories/body'
import { IntegrationlogRepositoryMemory } from '@repositories/integrationlog'
import { PEDIDOS10_KIND, PEDIDOS10_WEBHOOK_JOB, ReceivePedidos10Order } from './ReceivePedidos10Order.js'

describe('ReceivePedidos10Order', () => {
  it('logs, saves the payload body, and enqueues the pedidos10 webhook job', async () => {
    const integrationlogRepository = new IntegrationlogRepositoryMemory()
    const bodyRepository = new BodyRepositoryMemory()
    const jobQueue = {
      addJob: jest.fn().mockResolvedValue(undefined),
    }
    const receivePedidos10Order = new ReceivePedidos10Order({
      integrationlogRepository,
      bodyRepository,
      jobQueue,
    })

    const bodySaved = await receivePedidos10Order.execute({
      licenseeId: 'licensee-id',
      MerchantExternalCode: 'merchant-external-code',
      order: { id: 'order-id' },
    })

    expect(bodySaved).toEqual(
      expect.objectContaining({
        content: {
          MerchantExternalCode: 'merchant-external-code',
          order: { id: 'order-id' },
        },
        licensee: 'licensee-id',
        kind: PEDIDOS10_KIND,
      }),
    )

    const integrationlog = await integrationlogRepository.findFirst({ licensee: 'licensee-id' })
    expect(integrationlog.log_payload).toEqual(bodySaved.content)
    expect(jobQueue.addJob).toHaveBeenCalledWith(PEDIDOS10_WEBHOOK_JOB, {
      bodyId: bodySaved._id,
      licenseeId: 'licensee-id',
    })
  })
})
