class GetBaileysQrForSector {
  sectorRepository: any
  licenseeRepository: any
  createMessengerPlugin: any
  startBaileysSocket: any

  constructor({
    sectorRepository,
    licenseeRepository,
    createMessengerPlugin,
    startBaileysSocket,
  }: Record<string, any> = {}) {
    this.sectorRepository = sectorRepository
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.startBaileysSocket = startBaileysSocket
  }

  async execute(sectorId: any) {
    const sector = await this.sectorRepository.findFirst({ _id: sectorId })
    if (!sector) {
      return { message: 'Setor não encontrado' }
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: sector.licensee })
    if (!licensee || licensee.whatsappDefault !== 'baileys') {
      return { message: 'Licensee não usa Baileys' }
    }

    const plugin = this.createMessengerPlugin(licensee, { sector })
    const qr = await plugin.getQrCode()

    if (!qr) {
      if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
        this.startBaileysSocket?.(licensee, sector).catch(() => {})
      }
      return { connected: true, message: 'Já conectado' }
    }

    return { qr }
  }
}

export { GetBaileysQrForSector }
