import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { ContactRepositoryMemory } from '@repositories/contact'
import { InboxRepositoryMemory } from '@repositories/inbox'
import { SyncBaileysDirectoryForInbox, NOT_BAILEYS_MESSAGE } from './SyncBaileysDirectoryForInbox'

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

function buildUseCase({ groups }: { groups?: any[] } = {}) {
  const inboxRepository = new InboxRepositoryMemory()
  const licenseeRepository = new LicenseeRepositoryMemory()
  const contactRepository = new ContactRepositoryMemory()
  const resolvedGroups = groups !== undefined ? groups : DEFAULT_GROUPS
  const plugin = { fetchGroups: jest.fn().mockResolvedValue({ groups: resolvedGroups }) }
  const createMessengerPlugin = jest.fn().mockReturnValue(plugin)
  const useCase = new SyncBaileysDirectoryForInbox({
    inboxRepository,
    licenseeRepository,
    contactRepository,
    createMessengerPlugin,
  })
  return { inboxRepository, licenseeRepository, contactRepository, createMessengerPlugin, plugin, useCase }
}

describe('SyncBaileysDirectoryForInbox', () => {
  it('returns message when inbox is not found', async () => {
    const { useCase, createMessengerPlugin } = buildUseCase()

    const result = await useCase.execute('000000000000000000000000')

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: 'Inbox não encontrado' })
  })

  it('returns NOT_BAILEYS_MESSAGE when inbox does not use baileys', async () => {
    const { inboxRepository, licenseeRepository, useCase, createMessengerPlugin } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({ name: 'Suporte', licensee: licensee._id, kind: 'messenger', whatsappDefault: 'dialog' })

    const result = await useCase.execute(inbox._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: NOT_BAILEYS_MESSAGE })
  })

  it('returns NOT_BAILEYS_MESSAGE when licensee is not found', async () => {
    const { inboxRepository, useCase, createMessengerPlugin } = buildUseCase()
    const inbox = await inboxRepository.create({ name: 'Suporte', licensee: '000000000000000000000001', kind: 'messenger', whatsappDefault: 'baileys' })

    const result = await useCase.execute(inbox._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: NOT_BAILEYS_MESSAGE })
  })

  it('imports new groups as contacts with isGroup: true', async () => {
    const { inboxRepository, licenseeRepository, contactRepository, useCase, plugin } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({ name: 'Suporte', licensee: licensee._id, kind: 'messenger', whatsappDefault: 'baileys' })

    const result = await useCase.execute(inbox._id)

    expect(plugin.fetchGroups).toHaveBeenCalled()
    expect(result).toEqual({ importedContacts: 0, updatedContacts: 0, importedGroups: 2, updatedGroups: 0, skipped: 0 })

    const contacts = await contactRepository.find({ licensee: licensee._id })
    expect(contacts.length).toBe(2)
    expect(contacts[0].isGroup).toBe(true)
    expect(contacts[1].isGroup).toBe(true)
  })

  it('updates existing contacts matched by waId', async () => {
    const { inboxRepository, licenseeRepository, contactRepository, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({ name: 'Suporte', licensee: licensee._id, kind: 'messenger', whatsappDefault: 'baileys' })
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

    const result = await useCase.execute(inbox._id)

    expect(result).toEqual({ importedContacts: 0, updatedContacts: 0, importedGroups: 1, updatedGroups: 1, skipped: 0 })

    const contacts = await contactRepository.find({ licensee: licensee._id })
    expect(contacts.length).toBe(2)
    const updated = contacts.find((c: any) => c.waId === '1234567890@g.us')
    expect(updated.name).toBe('Grupo Alpha')
    expect(updated.isGroup).toBe(true)
  })

  it('passes inbox to createMessengerPlugin', async () => {
    const { inboxRepository, licenseeRepository, createMessengerPlugin, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({ name: 'Suporte', licensee: licensee._id, kind: 'messenger', whatsappDefault: 'baileys' })

    await useCase.execute(inbox._id)

    expect(createMessengerPlugin).toHaveBeenCalledWith(licensee, { inbox })
  })

  it('deactivates existing groups for the licensee before syncing', async () => {
    const { inboxRepository, licenseeRepository, contactRepository, useCase } = buildUseCase({ groups: [] })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({ name: 'Suporte', licensee: licensee._id, kind: 'messenger', whatsappDefault: 'baileys' })
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

    await useCase.execute(inbox._id)

    const contacts = await contactRepository.find({ licensee: licensee._id })
    const deactivated = contacts.find((c: any) => String(c._id) === String(group._id))
    expect(deactivated.active).toBe(false)
  })

  it('returns zero counts when groups list is empty', async () => {
    const { inboxRepository, licenseeRepository, useCase } = buildUseCase({ groups: [] })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build())
    const inbox = await inboxRepository.create({ name: 'Suporte', licensee: licensee._id, kind: 'messenger', whatsappDefault: 'baileys' })

    const result = await useCase.execute(inbox._id)

    expect(result).toEqual({ importedContacts: 0, updatedContacts: 0, importedGroups: 0, updatedGroups: 0, skipped: 0 })
  })
})
