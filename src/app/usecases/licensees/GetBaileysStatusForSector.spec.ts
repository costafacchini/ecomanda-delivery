import { GetBaileysStatusForSector } from './GetBaileysStatusForSector'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { WhatsappSessionRepositoryMemory } from '@repositories/whatsappsession'
import { SectorRepositoryMemory } from '@repositories/sector'
import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'

function buildUseCase(overrides: Record<string, any> = {}) {
  const licenseeRepository = overrides.licenseeRepository ?? new LicenseeRepositoryMemory()
  const whatsappSessionRepository = overrides.whatsappSessionRepository ?? new WhatsappSessionRepositoryMemory()
  const sectorRepository = overrides.sectorRepository ?? new SectorRepositoryMemory()
  const useCase = new GetBaileysStatusForSector({ licenseeRepository, whatsappSessionRepository, sectorRepository })
  return { licenseeRepository, whatsappSessionRepository, sectorRepository, useCase }
}

describe('GetBaileysStatusForSector', () => {
  it('returns { connected: false } when sector is not found', async () => {
    const { useCase } = buildUseCase()

    const result = await useCase.execute('000000000000000000000000')

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when licensee does not use baileys', async () => {
    const { licenseeRepository, sectorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'dialog' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when no session exists for the licensee', async () => {
    const { licenseeRepository, sectorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when sector session exists but creds are empty', async () => {
    const { licenseeRepository, whatsappSessionRepository, sectorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await whatsappSessionRepository.create({ licensee: licensee._id, sector: sector._id, creds: {}, keys: {} })

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: true } when sector session has non-empty creds', async () => {
    const { licenseeRepository, whatsappSessionRepository, sectorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      sector: sector._id,
      creds: { registered: true, me: { id: '5511999999999' } },
    })

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ connected: true })
  })

  it('returns { connected: false } when only a general licensee session (no sector) exists', async () => {
    const { licenseeRepository, whatsappSessionRepository, sectorRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      creds: { registered: true, me: { id: '5511999999999' } },
    })

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ connected: false })
  })
})
