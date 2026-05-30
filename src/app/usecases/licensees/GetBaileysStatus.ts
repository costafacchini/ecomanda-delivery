class GetBaileysStatus {
  licenseeRepository: any
  whatsappSessionRepository: any

  constructor({ licenseeRepository, whatsappSessionRepository }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
  }

  async execute(id) {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (!licensee || licensee.whatsappDefault !== 'baileys') {
      return { connected: false }
    }

    const session = await this.whatsappSessionRepository.findFirst({ licensee: id })
    const connected = !!(session?.creds && Object.keys(session.creds).length > 0)

    return { connected }
  }
}

export { GetBaileysStatus }
