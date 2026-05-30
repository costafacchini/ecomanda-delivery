const WEBHOOK_CONFIGURED_MESSAGE = 'Webhook configurado!'

class SetDialogWebhook {
  licenseeRepository: any
  createMessengerPlugin: any

  constructor({ licenseeRepository, createMessengerPlugin }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
  }

  async execute(id) {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (licensee.whatsappDefault === 'dialog') {
      const messengerPlugin = this.createMessengerPlugin(licensee)
      await messengerPlugin.setWebhook(licensee.whatsappUrl, licensee.whatsappToken)
    }

    return { message: WEBHOOK_CONFIGURED_MESSAGE }
  }
}

export { SetDialogWebhook, WEBHOOK_CONFIGURED_MESSAGE }
