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

  async execute(licensee: any, setor: any = null) {
    const plugin = this.createMessengerPlugin(licensee)

    const setorId = setor?._id ?? null
    let session = await this.whatsappSessionRepository.findFirst({ licensee: licensee._id, setor: setorId })
    if (!session) {
      session = await this.whatsappSessionRepository.create({ licensee: licensee._id, setor: setorId })
    }

    await this.socketManager.start(session, licensee, {
      onMessage: async (msg: any) => {
        await this.ingestMessengerMessage.execute({
          body: msg,
          licenseeId: licensee._id,
          setorId,
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
