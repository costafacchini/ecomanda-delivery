class GetBaileysQrForSetor {
  setorRepository: any
  licenseeRepository: any
  createMessengerPlugin: any
  startBaileysSocket: any

  constructor({
    setorRepository,
    licenseeRepository,
    createMessengerPlugin,
    startBaileysSocket,
  }: Record<string, any> = {}) {
    this.setorRepository = setorRepository
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.startBaileysSocket = startBaileysSocket
  }

  async execute(setorId: any) {
    const setor = await this.setorRepository.findFirst({ _id: setorId })
    if (!setor) {
      return { message: 'Setor não encontrado' }
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: setor.licensee })
    if (!licensee || licensee.whatsappDefault !== 'baileys') {
      return { message: 'Licensee não usa Baileys' }
    }

    const plugin = this.createMessengerPlugin(licensee)
    const qr = await plugin.getQrCode()

    if (!qr) {
      if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
        this.startBaileysSocket?.(licensee, setor).catch(() => {})
      }
      return { message: 'Já conectado' }
    }

    return { qr }
  }
}

export { GetBaileysQrForSetor }
