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
import { SetorRepositoryMemory } from '@repositories/setor'
import { WhatsappSessionRepositoryMemory } from '@repositories/whatsappsession'
import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { BootBaileysSocketSessions } from './BootBaileysSocketSessions'

function buildUseCase(overrides: Record<string, any> = {}) {
  const licenseeRepository = overrides.licenseeRepository ?? new LicenseeRepositoryMemory()
  const setorRepository = overrides.setorRepository ?? new SetorRepositoryMemory()
  const whatsappSessionRepository = overrides.whatsappSessionRepository ?? new WhatsappSessionRepositoryMemory()
  const startBaileysSocket = overrides.startBaileysSocket ?? jest.fn().mockResolvedValue(undefined)
  const useCase = new BootBaileysSocketSessions({
    licenseeRepository,
    setorRepository,
    whatsappSessionRepository,
    startBaileysSocket,
  })
  return { useCase, licenseeRepository, setorRepository, whatsappSessionRepository, startBaileysSocket }
}

describe('BootBaileysSocketSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts socket for each session with active creds', async () => {
    const { useCase, licenseeRepository, whatsappSessionRepository, startBaileysSocket } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    await whatsappSessionRepository.create({ licensee: licensee._id, creds: { noiseKey: 'some-creds' }, keys: {} })

    await useCase.execute()

    expect(startBaileysSocket).toHaveBeenCalledWith(licensee, null)
  })

  it('skips session when creds is empty', async () => {
    const { useCase, licenseeRepository, whatsappSessionRepository, startBaileysSocket } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const session = await whatsappSessionRepository.create({ licensee: licensee._id, creds: {}, keys: {} })

    await useCase.execute()

    expect(startBaileysSocket).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(`Baileys boot: sessão ${session._id} sem creds ativas, ignorando.`)
  })

  it('skips session when session does not exist (no sessions at all)', async () => {
    const { useCase, startBaileysSocket } = buildUseCase()

    await useCase.execute()

    expect(startBaileysSocket).not.toHaveBeenCalled()
  })

  it('loads setor and passes it to startBaileysSocket when session has setor', async () => {
    const { useCase, licenseeRepository, setorRepository, whatsappSessionRepository, startBaileysSocket } =
      buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const setor = await setorRepository.create({ name: 'Setor A', licensee: licensee._id })
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      setor: setor._id,
      creds: { noiseKey: 'creds-1' },
      keys: {},
    })

    await useCase.execute()

    expect(startBaileysSocket).toHaveBeenCalledWith(licensee, setor)
  })

  it('logs error and continues when startBaileysSocket throws for one session', async () => {
    const { useCase, licenseeRepository, whatsappSessionRepository, startBaileysSocket } = buildUseCase()
    const licensee1 = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const licensee2 = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const session1 = await whatsappSessionRepository.create({
      licensee: licensee1._id,
      creds: { noiseKey: 'creds-1' },
      keys: {},
    })
    await whatsappSessionRepository.create({ licensee: licensee2._id, creds: { noiseKey: 'creds-2' }, keys: {} })

    startBaileysSocket.mockRejectedValueOnce(new Error('socket failure'))

    await useCase.execute()

    expect(startBaileysSocket).toHaveBeenCalledTimes(2)
    expect(logger.error).toHaveBeenCalledWith(
      `Baileys boot: falha ao iniciar socket para sessão ${session1._id}: socket failure`,
    )
  })
})
