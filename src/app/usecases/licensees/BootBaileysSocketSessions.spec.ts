jest.mock('../../helpers/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}))

import { logger } from '../../helpers/logger'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { WhatsappSessionRepositoryMemory } from '@repositories/whatsappsession'
import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { BootBaileysSocketSessions } from './BootBaileysSocketSessions'

function buildUseCase(overrides: Record<string, any> = {}) {
  const licenseeRepository = overrides.licenseeRepository ?? new LicenseeRepositoryMemory()
  const whatsappSessionRepository = overrides.whatsappSessionRepository ?? new WhatsappSessionRepositoryMemory()
  const startBaileysSocket = overrides.startBaileysSocket ?? jest.fn().mockResolvedValue(undefined)
  const useCase = new BootBaileysSocketSessions({ licenseeRepository, whatsappSessionRepository, startBaileysSocket })
  return { useCase, licenseeRepository, whatsappSessionRepository, startBaileysSocket }
}

describe('BootBaileysSocketSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts socket for each baileys licensee with active session creds', async () => {
    const { useCase, licenseeRepository, whatsappSessionRepository, startBaileysSocket } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    await whatsappSessionRepository.create({ licensee: licensee._id, creds: { noiseKey: 'some-creds' }, keys: {} })

    await useCase.execute()

    expect(startBaileysSocket).toHaveBeenCalledWith(licensee)
  })

  it('skips licensee when session has no creds', async () => {
    const { useCase, licenseeRepository, whatsappSessionRepository, startBaileysSocket } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    await whatsappSessionRepository.create({ licensee: licensee._id, creds: {}, keys: {} })

    await useCase.execute()

    expect(startBaileysSocket).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(`Baileys boot: licensee ${licensee._id} sem sessão ativa, ignorando.`)
  })

  it('skips licensee when session does not exist', async () => {
    const { useCase, licenseeRepository, startBaileysSocket } = buildUseCase()
    await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))

    await useCase.execute()

    expect(startBaileysSocket).not.toHaveBeenCalled()
  })

  it('does not start socket for licensees not using baileys', async () => {
    const { useCase, licenseeRepository, startBaileysSocket } = buildUseCase()
    await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'dialog' }))

    await useCase.execute()

    expect(startBaileysSocket).not.toHaveBeenCalled()
  })

  it('logs error and continues when startBaileysSocket throws for one licensee', async () => {
    const { useCase, licenseeRepository, whatsappSessionRepository, startBaileysSocket } = buildUseCase()
    const licensee1 = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const licensee2 = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    await whatsappSessionRepository.create({ licensee: licensee1._id, creds: { noiseKey: 'creds-1' }, keys: {} })
    await whatsappSessionRepository.create({ licensee: licensee2._id, creds: { noiseKey: 'creds-2' }, keys: {} })

    startBaileysSocket.mockRejectedValueOnce(new Error('socket failure'))

    await useCase.execute()

    expect(startBaileysSocket).toHaveBeenCalledTimes(2)
    expect(logger.error).toHaveBeenCalledWith(
      `Baileys boot: falha ao iniciar socket para licensee ${licensee1._id}: socket failure`,
    )
  })
})
