import { BodyRepositoryMemory } from '@repositories/body'
import { IntegrationlogRepositoryMemory } from '@repositories/integrationlog'
import {
  ChangePedidos10OrderStatus,
  PEDIDOS10_CHANGE_ORDER_STATUS_JOB,
  PEDIDOS10_KIND,
} from './ChangePedidos10OrderStatus'

describe('ChangePedidos10OrderStatus', () => {
  it('logs, saves the status payload body, and enqueues the pedidos10 status job', async () => {
    const integrationlogRepository = new IntegrationlogRepositoryMemory()
    const bodyRepository = new BodyRepositoryMemory()
    const jobQueue = {
      addJob: jest.fn().mockResolvedValue(undefined),
    }
    const changePedidos10OrderStatus = new ChangePedidos10OrderStatus({
      integrationlogRepository,
      bodyRepository,
      jobQueue,
    })

    const bodySaved = await changePedidos10OrderStatus.execute({
      licenseeId: 'licensee-id',
      order: 'order-id',
      status: 'delivered',
    })

    expect(bodySaved).toEqual(
      expect.objectContaining({
        content: {
          order: 'order-id',
          status: 'delivered',
        },
        licensee: 'licensee-id',
        kind: PEDIDOS10_KIND,
      }),
    )

    const integrationlog = await integrationlogRepository.findFirst({ licensee: 'licensee-id' })
    expect(integrationlog.log_payload).toEqual(bodySaved.content)
    expect(jobQueue.addJob).toHaveBeenCalledWith(PEDIDOS10_CHANGE_ORDER_STATUS_JOB, {
      bodyId: bodySaved._id,
      licenseeId: 'licensee-id',
    })
  })
})
