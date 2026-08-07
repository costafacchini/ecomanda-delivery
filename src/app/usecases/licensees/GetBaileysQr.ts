import { IRepository } from '@repositories/repository'
import { ILicensee } from '../../../types'

interface GetBaileysQrDeps {
  licenseeRepository: IRepository<ILicensee>
  createMessengerPlugin: (licensee: ILicensee) => any
  startBaileysSocket?: (licensee: ILicensee) => Promise<void>
}

class GetBaileysQr {
  licenseeRepository: IRepository<ILicensee>
  createMessengerPlugin: GetBaileysQrDeps['createMessengerPlugin']
  startBaileysSocket?: GetBaileysQrDeps['startBaileysSocket']

  constructor({ licenseeRepository, createMessengerPlugin, startBaileysSocket }: GetBaileysQrDeps) {
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.startBaileysSocket = startBaileysSocket
  }

  async execute(id: string): Promise<{ qr: string } | { message: string }> {
    const licensee = await this.licenseeRepository.findFirst({ _id: id })

    if (!licensee || licensee.whatsappDefault !== 'baileys') {
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

    return { qr }
  }
}

export { GetBaileysQr }
