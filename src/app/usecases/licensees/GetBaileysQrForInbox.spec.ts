import { GetBaileysQrForInbox } from './GetBaileysQrForInbox'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { InboxRepositoryMemory } from '@repositories/inbox'
import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'

function buildUseCase(overrides: Record<string, any> = {}) {
  const licenseeRepository = overrides.licenseeRepository ?? new LicenseeRepositoryMemory()
  const inboxRepository = overrides.inboxRepository ?? new InboxRepositoryMemory()
  const createMessengerPlugin = overrides.createMessengerPlugin ?? jest.fn()
  const startBaileysSocket = overrides.startBaileysSocket
  const useCase = new GetBaileysQrForInbox({
    licenseeRepository,
    inboxRepository,
    createMessengerPlugin,
    startBaileysSocket,
  })
  return { licenseeRepository, inboxRepository, createMessengerPlugin, useCase }
}

describe('GetBaileysQrForInbox', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.ENABLE_BAILEYS_SOCKET
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns { message: "Inbox não encontrado" } when inbox is not found', async () => {
    const { useCase } = buildUseCase()

    const result = await useCase.execute('000000000000000000000000')

    expect(result).toEqual({ message: 'Inbox não encontrado' })
  })

  it('returns { message: "Inbox não usa Baileys" } when inbox does not use baileys', async () => {
    const { licenseeRepository, inboxRepository, createMessengerPlugin, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'dialog',
    })

    const result = await useCase.execute(inbox._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: 'Inbox não usa Baileys' })
  })

  it('returns { message: "Inbox não usa Baileys" } when licensee is not found', async () => {
    const { inboxRepository, createMessengerPlugin, useCase } = buildUseCase()
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: '000000000000000000000001',
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })

    const result = await useCase.execute(inbox._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: 'Inbox não usa Baileys' })
  })

  it('returns { qr } when plugin.getQrCode() returns a QR string', async () => {
    const { licenseeRepository, inboxRepository, createMessengerPlugin, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })
    const plugin = { getQrCode: jest.fn().mockResolvedValue('qr-string-data') }
    createMessengerPlugin.mockReturnValue(plugin)

    const result = await useCase.execute(inbox._id)

    expect(createMessengerPlugin).toHaveBeenCalledWith(licensee, { inbox })
    expect(result).toEqual({ qr: 'qr-string-data' })
  })

  it('returns { connected: true, message: "Já conectado" } when plugin.getQrCode() returns null', async () => {
    const { licenseeRepository, inboxRepository, createMessengerPlugin, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })
    const plugin = { getQrCode: jest.fn().mockResolvedValue(null) }
    createMessengerPlugin.mockReturnValue(plugin)

    const result = await useCase.execute(inbox._id)

    expect(result).toEqual({ connected: true, message: 'Já conectado' })
  })

  it('calls startBaileysSocket with licensee and inbox when ENABLE_BAILEYS_SOCKET is true and already connected', async () => {
    process.env.ENABLE_BAILEYS_SOCKET = 'true'
    const startBaileysSocket = jest.fn().mockResolvedValue(undefined)
    const { licenseeRepository, inboxRepository, createMessengerPlugin, useCase } = buildUseCase({ startBaileysSocket })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })
    const plugin = { getQrCode: jest.fn().mockResolvedValue(null) }
    createMessengerPlugin.mockReturnValue(plugin)

    await useCase.execute(inbox._id)

    expect(startBaileysSocket).toHaveBeenCalledWith(licensee, inbox)
  })

  it('does not call startBaileysSocket when ENABLE_BAILEYS_SOCKET is not set', async () => {
    const startBaileysSocket = jest.fn()
    const { licenseeRepository, inboxRepository, createMessengerPlugin, useCase } = buildUseCase({ startBaileysSocket })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })
    const plugin = { getQrCode: jest.fn().mockResolvedValue(null) }
    createMessengerPlugin.mockReturnValue(plugin)

    await useCase.execute(inbox._id)

    expect(startBaileysSocket).not.toHaveBeenCalled()
  })
})
