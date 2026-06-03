class GetBaileysQr {
  licenseeRepository: any
  createMessengerPlugin: any
  startBaileysSocket: any

  constructor({ licenseeRepository, createMessengerPlugin, startBaileysSocket }: Record<string, any> = {}) {
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.startBaileysSocket = startBaileysSocket
  }

  async execute(id: any) {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (licensee.whatsappDefault !== 'baileys') {
      return { message: 'Licensee não usa Baileys' }
    }

    const plugin = this.createMessengerPlugin(licensee)
    const qr = await plugin.getQrCode()

    if (!qr) {
      if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
        this.startBaileysSocket?.(licensee).catch(() => {})
      }
      return { message: 'Já conectado' }
    }

    if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
      this.startBaileysSocket?.(licensee).catch(() => {})
    }

    return { qr }
  }
}

export { GetBaileysQr }
