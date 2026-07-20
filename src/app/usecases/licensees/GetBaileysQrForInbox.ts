const WHATSAPP_DEFAULT_BAILEYS = 'baileys'

class GetBaileysQrForInbox {
  inboxRepository: any
  licenseeRepository: any
  createMessengerPlugin: any
  startBaileysSocket: any

  constructor({
    inboxRepository,
    licenseeRepository,
    createMessengerPlugin,
    startBaileysSocket,
  }: Record<string, any> = {}) {
    this.inboxRepository = inboxRepository
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.startBaileysSocket = startBaileysSocket
  }

  async execute(inboxId: any) {
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
