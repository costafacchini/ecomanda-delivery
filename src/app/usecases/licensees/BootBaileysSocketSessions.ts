import { logger } from '../../helpers/logger'

class BootBaileysSocketSessions {
  licenseeRepository: any
  departmentRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any

  constructor({
    licenseeRepository,
    departmentRepository,
    whatsappSessionRepository,
    startBaileysSocket,
  }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.departmentRepository = departmentRepository
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

        const department = session.department ? await this.departmentRepository.findFirst({ _id: session.department }) : null

        logger.info(`Baileys boot: iniciando socket para sessão ${session._id} (licensee ${licensee._id})`)
        await this.startBaileysSocket(licensee, department)
      } catch (err: any) {
        logger.error(`Baileys boot: falha ao iniciar socket para sessão ${session._id}: ${err.message ?? err}`)
      }
    }
  }
}

export { BootBaileysSocketSessions }
