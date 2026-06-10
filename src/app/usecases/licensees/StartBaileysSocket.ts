import { logger } from '../../helpers/logger'

class StartBaileysSocket {
  socketManager: any
  whatsappSessionRepository: any
  createMessengerPlugin: any
  ingestMessengerMessage: any

  constructor({
    socketManager,
    whatsappSessionRepository,
    createMessengerPlugin,
    ingestMessengerMessage,
  }: Record<string, any> = {}) {
    this.socketManager = socketManager
    this.whatsappSessionRepository = whatsappSessionRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.ingestMessengerMessage = ingestMessengerMessage
  }

  async execute(licensee: any, sector: any = null) {
    const extras: any = {}
    if (sector) {
      extras.sector = sector._id
    }
    const plugin = this.createMessengerPlugin(licensee, extras)

    const sectorId = sector?._id ?? null
    let session = await this.whatsappSessionRepository.findFirst({ licensee: licensee._id, sector: sectorId })
    if (!session) {
      session = await this.whatsappSessionRepository.create({ licensee: licensee._id, sector: sectorId })
    }

    await this.socketManager.start(session, licensee, {
      onMessage: async (msg: any) => {
        await this.ingestMessengerMessage.execute({
          body: msg,
          licenseeId: licensee._id,
          sectorId,
        })
      },
      onReceiptUpdate: async (update: any) => {
        await plugin.responseToMessages(update)
      },
      onLogout: () => {
        logger.warn(`Baileys: sessão do licensee ${licensee._id} foi desconectada (logout).`)
      },
    })
  }
}

export { StartBaileysSocket }
