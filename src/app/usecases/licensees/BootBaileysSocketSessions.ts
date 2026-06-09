import { logger } from '../../helpers/logger'

class BootBaileysSocketSessions {
  licenseeRepository: any
  setorRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any

  constructor({
    licenseeRepository,
    setorRepository,
    whatsappSessionRepository,
    startBaileysSocket,
  }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.setorRepository = setorRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
  }

  async execute() {
    const sessions = await this.whatsappSessionRepository.find({})

    for (const session of sessions) {
      if (!session.creds || Object.keys(session.creds).length === 0) {
        logger.info(`Baileys boot: sessão ${session._id} sem creds ativas, ignorando.`)
        continue
      }

      try {
        const licensee = await this.licenseeRepository.findFirst({ _id: session.licensee })
        if (!licensee) {
          logger.warn(
            `Baileys boot: licensee ${session.licensee} não encontrado para sessão ${session._id}, ignorando.`,
          )
          continue
        }

        const setor = session.setor ? await this.setorRepository.findFirst({ _id: session.setor }) : null

        logger.info(`Baileys boot: iniciando socket para sessão ${session._id} (licensee ${licensee._id})`)
        await this.startBaileysSocket(licensee, setor)
      } catch (err: any) {
        logger.error(`Baileys boot: falha ao iniciar socket para sessão ${session._id}: ${err.message ?? err}`)
      }
    }
  }
}

export { BootBaileysSocketSessions }
