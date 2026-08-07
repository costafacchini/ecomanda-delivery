import { IRepository } from '@repositories/repository'
import { ILicensee, IInbox, IWhatsappSession } from '../../../types'
import { logger } from '../../helpers/logger'

interface SocketManager {
  start(session: IWhatsappSession, licensee: ILicensee, callbacks: Record<string, (...args: any[]) => any>): Promise<void>
}

interface IngestMessengerMessageUseCase {
  execute(input: { body: Record<string, any>; licenseeId: string; inboxId: string | null }): Promise<any>
}

interface StartBaileysSocketDeps {
  socketManager: SocketManager
  whatsappSessionRepository: IRepository<IWhatsappSession>
  createMessengerPlugin: (licensee: ILicensee, extras?: Record<string, any>) => any
  ingestMessengerMessage: IngestMessengerMessageUseCase
}

class StartBaileysSocket {
  socketManager: SocketManager
  whatsappSessionRepository: IRepository<IWhatsappSession>
  createMessengerPlugin: (licensee: ILicensee, extras?: Record<string, any>) => any
  ingestMessengerMessage: IngestMessengerMessageUseCase

  constructor({
    socketManager,
    whatsappSessionRepository,
    createMessengerPlugin,
    ingestMessengerMessage,
  }: StartBaileysSocketDeps) {
    this.socketManager = socketManager
    this.whatsappSessionRepository = whatsappSessionRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.ingestMessengerMessage = ingestMessengerMessage
  }

  async execute(licensee: ILicensee, inbox: IInbox | null = null) {
    const extras: Record<string, any> = {}
    if (inbox) {
      extras.inbox = inbox
    }
    const plugin = this.createMessengerPlugin(licensee, extras)

    const inboxId = inbox?._id ?? null
    let session = await this.whatsappSessionRepository.findFirst({ licensee: licensee._id, inbox: inboxId })
    if (!session) {
      session = await this.whatsappSessionRepository.create({ licensee: licensee._id, inbox: inboxId })
    }

    await this.socketManager.start(session, licensee, {
      onMessage: async (msg: any) => {
        await this.ingestMessengerMessage.execute({
          body: msg,
          licenseeId: licensee._id,
          inboxId,
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
