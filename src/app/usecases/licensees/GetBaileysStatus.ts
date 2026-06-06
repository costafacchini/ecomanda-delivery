class GetBaileysStatus {
  licenseeRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any
  socketManager: any

  constructor({
    licenseeRepository,
    whatsappSessionRepository,
    startBaileysSocket,
    socketManager,
  }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
    this.socketManager = socketManager
  }

  async execute(id: any) {
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
