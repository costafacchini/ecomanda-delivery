class GetBaileysStatusForSetor {
  setorRepository: any
  licenseeRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any
  socketManager: any

  constructor({
    setorRepository,
    licenseeRepository,
    whatsappSessionRepository,
    startBaileysSocket,
    socketManager,
  }: Record<string, any> = {}) {
    this.setorRepository = setorRepository
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
    this.socketManager = socketManager
  }

  async execute(setorId: any) {
    const setor = await this.setorRepository.findFirst({ _id: setorId })
    if (!setor) {
      return { connected: false }
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: setor.licensee })
    if (!licensee || licensee.whatsappDefault !== 'baileys') {
      return { connected: false }
    }

    const session = await this.whatsappSessionRepository.findFirst({ licensee: licensee._id, setor: setor._id })
    const connected = !!(session?.creds && Object.keys(session.creds).length > 0)

    if (connected && process.env.ENABLE_BAILEYS_SOCKET === 'true' && this.startBaileysSocket) {
      if (!this.socketManager?.isConnectedForLicensee(licensee._id, setor._id)) {
        this.startBaileysSocket(licensee, setor).catch(() => {})
      }
    }

    return { connected }
  }
}

export { GetBaileysStatusForSetor }
