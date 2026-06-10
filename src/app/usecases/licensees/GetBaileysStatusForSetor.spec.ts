import { GetBaileysStatusForSetor } from './GetBaileysStatusForSetor'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { WhatsappSessionRepositoryMemory } from '@repositories/whatsappsession'
import { SetorRepositoryMemory } from '@repositories/setor'
import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'

function buildUseCase(overrides: Record<string, any> = {}) {
  const licenseeRepository = overrides.licenseeRepository ?? new LicenseeRepositoryMemory()
  const whatsappSessionRepository = overrides.whatsappSessionRepository ?? new WhatsappSessionRepositoryMemory()
  const setorRepository = overrides.setorRepository ?? new SetorRepositoryMemory()
  const useCase = new GetBaileysStatusForSetor({ licenseeRepository, whatsappSessionRepository, setorRepository })
  return { licenseeRepository, whatsappSessionRepository, setorRepository, useCase }
}

describe('GetBaileysStatusForSetor', () => {
  it('returns { connected: false } when setor is not found', async () => {
    const { useCase } = buildUseCase()

    const result = await useCase.execute('000000000000000000000000')

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when licensee does not use baileys', async () => {
    const { licenseeRepository, setorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'dialog' }))
    const setor = await setorRepository.create({ name: 'Suporte', licensee: licensee._id })

    const result = await useCase.execute(setor._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when no session exists for the licensee', async () => {
    const { licenseeRepository, setorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const setor = await setorRepository.create({ name: 'Suporte', licensee: licensee._id })

    const result = await useCase.execute(setor._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when setor session exists but creds are empty', async () => {
    const { licenseeRepository, whatsappSessionRepository, setorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const setor = await setorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await whatsappSessionRepository.create({ licensee: licensee._id, setor: setor._id, creds: {}, keys: {} })

    const result = await useCase.execute(setor._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: true } when setor session has non-empty creds', async () => {
    const { licenseeRepository, whatsappSessionRepository, setorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const setor = await setorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      setor: setor._id,
      creds: { registered: true, me: { id: '5511999999999' } },
    })

    const result = await useCase.execute(setor._id)

    expect(result).toEqual({ connected: true })
  })

  it('returns { connected: false } when only a general licensee session (no setor) exists', async () => {
    const { licenseeRepository, whatsappSessionRepository, setorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const setor = await setorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      creds: { registered: true, me: { id: '5511999999999' } },
    })

    const result = await useCase.execute(setor._id)

    expect(result).toEqual({ connected: false })
  })
})
