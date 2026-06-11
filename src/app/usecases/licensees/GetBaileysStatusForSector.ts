class GetBaileysStatusForSector {
  sectorRepository: any
  licenseeRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any
  socketManager: any

  constructor({
    sectorRepository,
    licenseeRepository,
    whatsappSessionRepository,
    startBaileysSocket,
    socketManager,
  }: Record<string, any> = {}) {
    this.sectorRepository = sectorRepository
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
    this.socketManager = socketManager
  }

  async execute(sectorId: any) {
    const sector = await this.sectorRepository.findFirst({ _id: sectorId })
    if (!sector) {
      return { connected: false }
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: sector.licensee })
    if (!licensee || licensee.whatsappDefault !== 'baileys') {
      return { connected: false }
    }

    const session = await this.whatsappSessionRepository.findFirst({ licensee: licensee._id, sector: sector._id })
    const connected = !!(session?.creds && Object.keys(session.creds).length > 0)

    if (connected && process.env.ENABLE_BAILEYS_SOCKET === 'true' && this.startBaileysSocket) {
      if (!this.socketManager?.isConnectedForLicensee(licensee._id, sector._id)) {
        this.startBaileysSocket(licensee, sector).catch(() => {})
      }
    }

    return { connected }
  }
}

export { GetBaileysStatusForSector }
