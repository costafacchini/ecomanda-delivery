const WHATSAPP_DEFAULT_BAILEYS = 'baileys'

class GetBaileysStatusForInbox {
  inboxRepository: any
  licenseeRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any
  socketManager: any

  constructor({
    inboxRepository,
    licenseeRepository,
    whatsappSessionRepository,
    startBaileysSocket,
    socketManager,
  }: Record<string, any> = {}) {
    this.inboxRepository = inboxRepository
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
    this.socketManager = socketManager
  }

  async execute(inboxId: any) {
    const inbox = await this.inboxRepository.findFirst({ _id: inboxId })
    if (!inbox) {
      return { connected: false }
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: inbox.licensee })
    if (!licensee || inbox.whatsappDefault !== WHATSAPP_DEFAULT_BAILEYS) {
      return { connected: false }
    }

    // WhatsappSession.inbox field is added by task-02; queried by string ref so it
    // resolves correctly at runtime once both tasks are merged.
    const session = await this.whatsappSessionRepository.findFirst({
      licensee: licensee._id,
      inbox: inbox._id,
    })
    const connected = !!(session?.creds && Object.keys(session.creds).length > 0)

    if (connected && process.env.ENABLE_BAILEYS_SOCKET === 'true' && this.startBaileysSocket) {
      if (!this.socketManager?.isConnectedForLicensee(licensee._id, inbox._id)) {
        this.startBaileysSocket(licensee, inbox).catch(() => {})
      }
    }

    return { connected }
  }
}

export { GetBaileysStatusForInbox }
