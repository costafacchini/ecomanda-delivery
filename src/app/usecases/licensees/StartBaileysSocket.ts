import { logger } from '../../helpers/logger'

class StartBaileysSocket {
  socketManager: any
  createMessengerPlugin: any
  ingestMessengerMessage: any

  constructor({ socketManager, createMessengerPlugin, ingestMessengerMessage }: Record<string, any> = {}) {
    this.socketManager = socketManager
    this.createMessengerPlugin = createMessengerPlugin
    this.ingestMessengerMessage = ingestMessengerMessage
  }

  async execute(licensee: any) {
    const plugin = this.createMessengerPlugin(licensee)

    await this.socketManager.start(licensee, {
      onMessage: async (msg: any) => {
        await this.ingestMessengerMessage.execute({
          body: msg,
          licenseeId: licensee._id,
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
