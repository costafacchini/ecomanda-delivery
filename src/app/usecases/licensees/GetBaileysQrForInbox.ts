import { IRepository } from '@repositories/repository'
import { ILicensee, IInbox } from '../../../types'

const WHATSAPP_DEFAULT_BAILEYS = 'baileys'

interface GetBaileysQrForInboxDeps {
  inboxRepository: IRepository<IInbox>
  licenseeRepository: IRepository<ILicensee>
  createMessengerPlugin: (licensee: ILicensee, extras: Record<string, any>) => any
  startBaileysSocket?: (licensee: ILicensee, inbox: IInbox) => Promise<void>
}

class GetBaileysQrForInbox {
  inboxRepository: IRepository<IInbox>
  licenseeRepository: IRepository<ILicensee>
  createMessengerPlugin: GetBaileysQrForInboxDeps['createMessengerPlugin']
  startBaileysSocket?: GetBaileysQrForInboxDeps['startBaileysSocket']

  constructor({
    inboxRepository,
    licenseeRepository,
    createMessengerPlugin,
    startBaileysSocket,
  }: GetBaileysQrForInboxDeps) {
    this.inboxRepository = inboxRepository
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.startBaileysSocket = startBaileysSocket
  }

  async execute(inboxId: string) {
    const inbox = await this.inboxRepository.findFirst({ _id: inboxId })
    if (!inbox) {
      return { message: 'Inbox não encontrado' }
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: inbox.licensee })
    if (!licensee || inbox.whatsappDefault !== WHATSAPP_DEFAULT_BAILEYS) {
      return { message: 'Inbox não usa Baileys' }
    }

    const plugin = this.createMessengerPlugin(licensee, { inbox })
    const qr = await plugin.getQrCode()

    if (!qr) {
      if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
        this.startBaileysSocket?.(licensee, inbox).catch(() => {})
      }
      return { connected: true, message: 'Já conectado' }
    }

    return { qr }
  }
}

export { GetBaileysQrForInbox }
