import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { ContactRepositoryMemory } from '@repositories/contact'
import { SectorRepositoryMemory } from '@repositories/sector'
import { SyncBaileysDirectoryForSector, NOT_BAILEYS_MESSAGE } from './SyncBaileysDirectoryForSector'

const DEFAULT_GROUPS = [
  {
    waId: '1234567890@g.us',
    name: 'Grupo Alpha',
    number: '1234567890',
    type: '@g.us',
  },
  {
    waId: '9876543210@g.us',
    name: 'Grupo Beta',
    number: '9876543210',
    type: '@g.us',
  },
]

function buildUseCase({ groups } = {}) {
  const sectorRepository = new SectorRepositoryMemory()
  const licenseeRepository = new LicenseeRepositoryMemory()
  const contactRepository = new ContactRepositoryMemory()
  const resolvedGroups = groups !== undefined ? groups : DEFAULT_GROUPS
  const plugin = { fetchGroups: jest.fn().mockResolvedValue({ groups: resolvedGroups }) }
  const createMessengerPlugin = jest.fn().mockReturnValue(plugin)
  const useCase = new SyncBaileysDirectoryForSector({ sectorRepository, licenseeRepository, contactRepository, createMessengerPlugin })
  return { sectorRepository, licenseeRepository, contactRepository, createMessengerPlugin, plugin, useCase }
}

describe('SyncBaileysDirectoryForSector', () => {
  it('returns message when sector is not found', async () => {
    const { useCase, createMessengerPlugin } = buildUseCase()

    const result = await useCase.execute('000000000000000000000000')

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: 'Setor não encontrado' })
  })

  it('returns NOT_BAILEYS_MESSAGE when licensee does not use baileys', async () => {
    const { sectorRepository, licenseeRepository, useCase, createMessengerPlugin } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'dialog' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })

    const result = await useCase.execute(sector._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: NOT_BAILEYS_MESSAGE })
  })

  it('returns NOT_BAILEYS_MESSAGE when licensee is not found', async () => {
    const { sectorRepository, useCase, createMessengerPlugin } = buildUseCase()
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: '000000000000000000000001' })

    const result = await useCase.execute(sector._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: NOT_BAILEYS_MESSAGE })
  })

  it('imports new groups as contacts with isGroup: true', async () => {
    const { sectorRepository, licenseeRepository, contactRepository, useCase, plugin } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })

    const result = await useCase.execute(sector._id)

    expect(plugin.fetchGroups).toHaveBeenCalled()
    expect(result).toEqual({ importedContacts: 0, updatedContacts: 0, importedGroups: 2, updatedGroups: 0, skipped: 0 })

    const contacts = await contactRepository.find({ licensee: licensee._id })
    expect(contacts.length).toBe(2)
    expect(contacts[0].isGroup).toBe(true)
    expect(contacts[1].isGroup).toBe(true)
  })

  it('updates existing contacts matched by waId', async () => {
    const { sectorRepository, licenseeRepository, contactRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await contactRepository.create(
      contactFactory.build({
        number: '1234567890',
        type: '@g.us',
        waId: '1234567890@g.us',
        name: 'Old Name',
        licensee: licensee._id,
        talkingWithChatBot: false,
      }),
    )

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ importedContacts: 0, updatedContacts: 0, importedGroups: 1, updatedGroups: 1, skipped: 0 })

    const contacts = await contactRepository.find({ licensee: licensee._id })
    expect(contacts.length).toBe(2)
    const updated = contacts.find((c) => c.waId === '1234567890@g.us')
    expect(updated.name).toBe('Grupo Alpha')
    expect(updated.isGroup).toBe(true)
  })

  it('updates existing contacts matched by number+type when waId does not match any existing', async () => {
    const { sectorRepository, licenseeRepository, contactRepository, useCase } = buildUseCase({
      groups: [{ waId: '1234567890@g.us', name: 'Grupo Alpha', number: '1234567890', type: '@g.us' }],
    })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await contactRepository.create(
      contactFactory.build({
        number: '1234567890',
        type: '@g.us',
        waId: undefined,
        name: 'Old Name Without WaId',
        licensee: licensee._id,
        talkingWithChatBot: false,
      }),
    )

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ importedContacts: 0, updatedContacts: 0, importedGroups: 0, updatedGroups: 1, skipped: 0 })

    const contacts = await contactRepository.find({ licensee: licensee._id })
    expect(contacts.length).toBe(1)
    expect(contacts[0].name).toBe('Grupo Alpha')
    expect(contacts[0].isGroup).toBe(true)
  })

  it('passes sector to createMessengerPlugin', async () => {
    const { sectorRepository, licenseeRepository, createMessengerPlugin, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })

    await useCase.execute(sector._id)

    expect(createMessengerPlugin).toHaveBeenCalledWith(licensee, { sector })
  })

  it('deactivates existing groups for the licensee before syncing', async () => {
    const { sectorRepository, licenseeRepository, contactRepository, useCase } = buildUseCase({ groups: [] })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })
    const group = await contactRepository.create(
      contactFactory.build({
        number: '1234567890',
        type: '@g.us',
        waId: '1234567890@g.us',
        isGroup: true,
        active: true,
        licensee: licensee._id,
        talkingWithChatBot: false,
      }),
    )

    await useCase.execute(sector._id)

    const contacts = await contactRepository.find({ licensee: licensee._id })
    const deactivated = contacts.find((c) => String(c._id) === String(group._id))
    expect(deactivated.active).toBe(false)
  })

  it('reactivates an inactive group that matches during sync', async () => {
    const { sectorRepository, licenseeRepository, contactRepository, useCase } = buildUseCase({
      groups: [{ waId: '1234567890@g.us', name: 'Grupo Alpha', number: '1234567890', type: '@g.us' }],
    })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })
    await contactRepository.create(
      contactFactory.build({
        number: '1234567890',
        type: '@g.us',
        waId: '1234567890@g.us',
        isGroup: true,
        active: false,
        licensee: licensee._id,
        talkingWithChatBot: false,
      }),
    )

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ importedContacts: 0, updatedContacts: 0, importedGroups: 0, updatedGroups: 1, skipped: 0 })

    const contacts = await contactRepository.find({ licensee: licensee._id })
    expect(contacts.length).toBe(1)
    expect(contacts[0].active).toBe(true)
    expect(contacts[0].isGroup).toBe(true)
  })

  it('returns zero counts when groups list is empty', async () => {
    const { sectorRepository, licenseeRepository, useCase } = buildUseCase({ groups: [] })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const sector = await sectorRepository.create({ name: 'Suporte', licensee: licensee._id })

    const result = await useCase.execute(sector._id)

    expect(result).toEqual({ importedContacts: 0, updatedContacts: 0, importedGroups: 0, updatedGroups: 0, skipped: 0 })
  })
})
