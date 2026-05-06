import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { GetBaileysQr } from './GetBaileysQr.js'

describe('GetBaileysQr', () => {
  it('returns { qr } when plugin.getQrCode() returns a QR string', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const plugin = { getQrCode: jest.fn().mockResolvedValue('qr-string-data') }
    const createMessengerPlugin = jest.fn().mockReturnValue(plugin)
    const useCase = new GetBaileysQr({ licenseeRepository, createMessengerPlugin })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))

    const response = await useCase.execute(licensee._id)

    expect(createMessengerPlugin).toHaveBeenCalledWith(licensee)
    expect(plugin.getQrCode).toHaveBeenCalled()
    expect(response).toEqual({ qr: 'qr-string-data' })
  })

  it('returns { message: "Já conectado" } when plugin.getQrCode() returns null', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const plugin = { getQrCode: jest.fn().mockResolvedValue(null) }
    const createMessengerPlugin = jest.fn().mockReturnValue(plugin)
    const useCase = new GetBaileysQr({ licenseeRepository, createMessengerPlugin })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))

    const response = await useCase.execute(licensee._id)

    expect(response).toEqual({ message: 'Já conectado' })
  })

  it('returns { message: "Licensee não usa Baileys" } when licensee does not use baileys', async () => {
    const licenseeRepository = new LicenseeRepositoryMemory()
    const plugin = { getQrCode: jest.fn() }
    const createMessengerPlugin = jest.fn().mockReturnValue(plugin)
    const useCase = new GetBaileysQr({ licenseeRepository, createMessengerPlugin })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'dialog' }))

    const response = await useCase.execute(licensee._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(plugin.getQrCode).not.toHaveBeenCalled()
    expect(response).toEqual({ message: 'Licensee não usa Baileys' })
  })
})
