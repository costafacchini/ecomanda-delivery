import { IRepository } from '@repositories/repository'
import { ILicensee, IWhatsappSession } from '../../../types'

interface GetBaileysStatusDeps {
  licenseeRepository: IRepository<ILicensee>
  whatsappSessionRepository: IRepository<IWhatsappSession>
  startBaileysSocket?: (licensee: ILicensee) => Promise<void>
  socketManager?: { isConnected(id: string): boolean }
}

class GetBaileysStatus {
  licenseeRepository: IRepository<ILicensee>
  whatsappSessionRepository: IRepository<IWhatsappSession>
  startBaileysSocket?: GetBaileysStatusDeps['startBaileysSocket']
  socketManager?: GetBaileysStatusDeps['socketManager']

  constructor({
    licenseeRepository,
    whatsappSessionRepository,
    startBaileysSocket,
    socketManager,
  }: GetBaileysStatusDeps) {
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
    this.socketManager = socketManager
  }

  async execute(id: string): Promise<{ connected: boolean }> {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (!licensee || licensee.whatsappDefault !== 'baileys') {
      return { connected: false }
    }

    const session = await this.whatsappSessionRepository.findFirst({ licensee: id })
    const connected = !!(session?.creds && Object.keys(session.creds).length > 0)

    if (connected && process.env.ENABLE_BAILEYS_SOCKET === 'true' && this.startBaileysSocket) {
      if (!this.socketManager?.isConnected(id)) {
        this.startBaileysSocket(licensee).catch(() => {})
      }
    }

    return { connected }
  }
}

export { GetBaileysStatus }
