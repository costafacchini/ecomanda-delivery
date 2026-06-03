import { logger } from '../../helpers/logger'

class BootBaileysSocketSessions {
  licenseeRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any

  constructor({ licenseeRepository, whatsappSessionRepository, startBaileysSocket }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
  }

  async execute() {
    const licensees = await this.licenseeRepository.find({ whatsappDefault: 'baileys' })

    for (const licensee of licensees) {
      try {
        const session = await this.whatsappSessionRepository.findFirst({ licensee: licensee._id })
        if (!session?.creds || Object.keys(session.creds).length === 0) {
          logger.info(`Baileys boot: licensee ${licensee._id} sem sessão ativa, ignorando.`)
          continue
        }
        logger.info(`Baileys boot: iniciando socket para licensee ${licensee._id}`)
        await this.startBaileysSocket(licensee)
      } catch (err: any) {
        logger.error(`Baileys boot: falha ao iniciar socket para licensee ${licensee._id}: ${err.message ?? err}`)
      }
    }
  }
}

export { BootBaileysSocketSessions }
