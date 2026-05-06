class GetBaileysQr {
  constructor({ licenseeRepository, createMessengerPlugin } = {}) {
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
  }

  async execute(id) {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (licensee.whatsappDefault !== 'baileys') {
      return { message: 'Licensee não usa Baileys' }
    }

    const plugin = this.createMessengerPlugin(licensee)
    const qr = await plugin.getQrCode()

    if (!qr) {
      return { message: 'Já conectado' }
    }

    return { qr }
  }
}

export { GetBaileysQr }
