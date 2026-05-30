const WEBHOOK_SIGNED_MESSAGE = 'Webhook assinado!'
const WEBHOOK_NOT_SIGNED_MESSAGE = 'Webhook não assinado pois não tem os dados para o login!'

function hasPedidos10IntegrationData(licensee) {
  const integration = licensee?.pedidos10_integration

  return !!integration && Object.keys(integration).length > 0
}

class SignPedidos10OrderWebhook {
  licenseeRepository: any
  createPedidos10: any

  constructor({ licenseeRepository, createPedidos10 }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.createPedidos10 = createPedidos10
  }

  async execute(id) {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (!hasPedidos10IntegrationData(licensee)) {
      return { message: WEBHOOK_NOT_SIGNED_MESSAGE }
    }

    const pedidos10 = this.createPedidos10(licensee)
    await pedidos10.signOrderWebhook()

    return { message: WEBHOOK_SIGNED_MESSAGE }
  }
}

export { SignPedidos10OrderWebhook, WEBHOOK_NOT_SIGNED_MESSAGE, WEBHOOK_SIGNED_MESSAGE }
