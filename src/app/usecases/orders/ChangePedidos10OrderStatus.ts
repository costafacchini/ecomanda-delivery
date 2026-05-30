const PEDIDOS10_KIND = 'pedidos10'
const PEDIDOS10_CHANGE_ORDER_STATUS_JOB = 'pedidos10-change-order-status'

class ChangePedidos10OrderStatus {
  integrationlogRepository: any
  bodyRepository: any
  jobQueue: any

  constructor({ integrationlogRepository, bodyRepository, jobQueue }: Record<string, any> = {}) {
    this.integrationlogRepository = integrationlogRepository
    this.bodyRepository = bodyRepository
    this.jobQueue = jobQueue
  }

  async execute({ licenseeId, order, status }: Record<string, any> = {}) {
    const payload = { order, status }

    await this.integrationlogRepository.create({
      licensee: licenseeId,
      log_payload: payload,
    })

    const bodySaved = await this.bodyRepository.create({
      content: payload,
      licensee: licenseeId,
      kind: PEDIDOS10_KIND,
    })

    await this.jobQueue.addJob(PEDIDOS10_CHANGE_ORDER_STATUS_JOB, {
      bodyId: bodySaved._id,
      licenseeId,
    })

    return bodySaved
  }
}

export { ChangePedidos10OrderStatus, PEDIDOS10_CHANGE_ORDER_STATUS_JOB, PEDIDOS10_KIND }
