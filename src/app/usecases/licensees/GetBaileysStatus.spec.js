import { GetBaileysStatus } from './GetBaileysStatus.js'
import { LicenseeRepositoryMemory } from '@repositories/licensee.js'
import { WhatsappSessionRepositoryMemory } from '@repositories/whatsappsession.js'
import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee.js'

function buildUseCase() {
  const licenseeRepository = new LicenseeRepositoryMemory()
  const whatsappSessionRepository = new WhatsappSessionRepositoryMemory()
  const useCase = new GetBaileysStatus({ licenseeRepository, whatsappSessionRepository })
  return { licenseeRepository, whatsappSessionRepository, useCase }
}

describe('GetBaileysStatus', () => {
  it('returns { connected: false } when licensee is not found', async () => {
    const { useCase } = buildUseCase()

    const result = await useCase.execute('000000000000000000000000')

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when licensee does not use baileys', async () => {
    const { licenseeRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'dialog' }))

    const result = await useCase.execute(licensee._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when no session exists for the licensee', async () => {
    const { licenseeRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))

    const result = await useCase.execute(licensee._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: false } when session exists but creds are empty', async () => {
    const { licenseeRepository, whatsappSessionRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    await whatsappSessionRepository.create({ licensee: licensee._id, creds: {}, keys: {} })

    const result = await useCase.execute(licensee._id)

    expect(result).toEqual({ connected: false })
  })

  it('returns { connected: true } when session has non-empty creds', async () => {
    const { licenseeRepository, whatsappSessionRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    await whatsappSessionRepository.create({
      licensee: licensee._id,
      creds: { registered: true, me: { id: '5511999999999' } },
    })

    const result = await useCase.execute(licensee._id)

    expect(result).toEqual({ connected: true })
  })
})
