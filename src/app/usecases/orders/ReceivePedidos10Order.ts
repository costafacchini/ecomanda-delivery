const PEDIDOS10_KIND = 'pedidos10'
const PEDIDOS10_WEBHOOK_JOB = 'pedidos10-webhook'

class ReceivePedidos10Order {
  integrationlogRepository: any
  bodyRepository: any
  jobQueue: any

  constructor({ integrationlogRepository, bodyRepository, jobQueue }: Record<string, any> = {}) {
    this.integrationlogRepository = integrationlogRepository
    this.bodyRepository = bodyRepository
    this.jobQueue = jobQueue
  }

  async execute({ licenseeId, MerchantExternalCode, order }: Record<string, any> = {}) {
    const payload = { MerchantExternalCode, order }

    await this.integrationlogRepository.create({
      licensee: licenseeId,
      log_payload: payload,
    })

    const bodySaved = await this.bodyRepository.create({
      content: payload,
      licensee: licenseeId,
      kind: PEDIDOS10_KIND,
    })

    await this.jobQueue.addJob(PEDIDOS10_WEBHOOK_JOB, {
      bodyId: bodySaved._id,
      licenseeId,
    })

    return bodySaved
  }
}

export { PEDIDOS10_KIND, PEDIDOS10_WEBHOOK_JOB, ReceivePedidos10Order }
