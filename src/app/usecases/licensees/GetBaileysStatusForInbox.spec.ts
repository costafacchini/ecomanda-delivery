import { GetBaileysStatusForInbox } from './GetBaileysStatusForInbox'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { WhatsappSessionRepositoryMemory } from '@repositories/whatsappsession'
import { InboxRepositoryMemory } from '@repositories/inbox'
import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'

function buildUseCase(overrides: Record<string, any> = {}) {
  const licenseeRepository = overrides.licenseeRepository ?? new LicenseeRepositoryMemory()
  const whatsappSessionRepository = overrides.whatsappSessionRepository ?? new WhatsappSessionRepositoryMemory()
  const inboxRepository = overrides.inboxRepository ?? new InboxRepositoryMemory()
  const startBaileysSocket = overrides.startBaileysSocket
  const socketManager = overrides.socketManager
  const useCase = new GetBaileysStatusForInbox({
    licenseeRepository,
    whatsappSessionRepository,
    inboxRepository,
    startBaileysSocket,
    socketManager,
  })
  return { licenseeRepository, whatsappSessionRepository, inboxRepository, useCase }
}

describe('GetBaileysStatusForInbox', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.ENABLE_BAILEYS_SOCKET
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns { connected: false } when inbox is not found', async () => {
    const { useCase } = buildUseCase()

    const result = await useCase.execute('000000000000000000000000')

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when inbox does not use baileys', async () => {
    const { licenseeRepository, inboxRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'dialog',
    })

    const result = await useCase.execute(inbox._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when licensee is not found', async () => {
    const { inboxRepository, useCase } = buildUseCase()
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: '000000000000000000000001',
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })

    const result = await useCase.execute(inbox._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when no session exists for the inbox', async () => {
    const { licenseeRepository, inboxRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })

    const result = await useCase.execute(inbox._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when inbox session exists but creds are empty', async () => {
    const { licenseeRepository, whatsappSessionRepository, inboxRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })
    await whatsappSessionRepository.create({ licensee: licensee._id, inbox: inbox._id, creds: {}, keys: {} })

    const result = await useCase.execute(inbox._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: true } when inbox session has non-empty creds', async () => {
    const { licenseeRepository, whatsappSessionRepository, inboxRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      inbox: inbox._id,
      creds: { registered: true, me: { id: '5511999999999' } },
    })

    const result = await useCase.execute(inbox._id)

    expect(result).toEqual({ connected: true })
  })

  it('starts the socket when connected and ENABLE_BAILEYS_SOCKET is true and socket is not yet running', async () => {
    process.env.ENABLE_BAILEYS_SOCKET = 'true'
    const startBaileysSocket = jest.fn().mockResolvedValue(undefined)
    const socketManager = { isConnectedForLicensee: jest.fn().mockReturnValue(false) }
    const { licenseeRepository, whatsappSessionRepository, inboxRepository, useCase } = buildUseCase({
      startBaileysSocket,
      socketManager,
    })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      inbox: inbox._id,
      creds: { registered: true, me: { id: '5511999999999' } },
    })

    await useCase.execute(inbox._id)

    expect(startBaileysSocket).toHaveBeenCalledWith(licensee, inbox)
  })

  it('does not start the socket when already connected in socket manager', async () => {
    process.env.ENABLE_BAILEYS_SOCKET = 'true'
    const startBaileysSocket = jest.fn().mockResolvedValue(undefined)
    const socketManager = { isConnectedForLicensee: jest.fn().mockReturnValue(true) }
    const { licenseeRepository, whatsappSessionRepository, inboxRepository, useCase } = buildUseCase({
      startBaileysSocket,
      socketManager,
    })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({
      name: 'Suporte',
      licensee: licensee._id,
      kind: 'messenger',
      whatsappDefault: 'baileys',
    })
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      inbox: inbox._id,
      creds: { registered: true, me: { id: '5511999999999' } },
    })

    await useCase.execute(inbox._id)

    expect(startBaileysSocket).not.toHaveBeenCalled()
  })
})
