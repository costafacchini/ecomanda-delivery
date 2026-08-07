import { IRepository } from '@repositories/repository'
import { ILicensee } from '../../../types'

const WEBHOOK_CONFIGURED_MESSAGE = 'Webhook configurado!'

interface SetDialogWebhookDeps {
  licenseeRepository: IRepository<ILicensee>
  createMessengerPlugin: (licensee: ILicensee) => any
}

class SetDialogWebhook {
  licenseeRepository: IRepository<ILicensee>
  createMessengerPlugin: SetDialogWebhookDeps['createMessengerPlugin']

  constructor({ licenseeRepository, createMessengerPlugin }: SetDialogWebhookDeps) {
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
  }

  async execute(id: string): Promise<{ message: string }> {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (licensee && licensee.whatsappDefault === 'dialog') {
      const messengerPlugin = this.createMessengerPlugin(licensee)
      await messengerPlugin.setWebhook(licensee.whatsappUrl, licensee.whatsappToken)
    }

    return { message: WEBHOOK_CONFIGURED_MESSAGE }
  }
}

export { SetDialogWebhook, WEBHOOK_CONFIGURED_MESSAGE }
