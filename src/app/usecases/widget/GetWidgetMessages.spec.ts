import { GetWidgetMessages } from './GetWidgetMessages'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { ContactRepositoryMemory } from '@repositories/contact'
import { RoomRepositoryMemory } from '@repositories/room'
import { MessageRepositoryMemory } from '@repositories/message'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { room as roomFactory } from '@factories/room'
import { message as messageFactory } from '@factories/message'

// RoomRepositoryMemory does not include findOpenForContact (that lives on the DB class).
// This subclass adds the method so unit tests can use an in-memory room store.
class RoomRepositoryMemoryWithFindOpenForContact extends RoomRepositoryMemory {
  findOpenForContact(contactId: any) {
    return this.findFirst({ contact: contactId, closed: false })
  }
}

function buildUseCase() {
  const licenseeRepository = new LicenseeRepositoryMemory()
  const contactRepository = new ContactRepositoryMemory()
  const roomRepository = new RoomRepositoryMemoryWithFindOpenForContact()
  const messageRepository = new MessageRepositoryMemory()

  const getWidgetMessages = new GetWidgetMessages({
    licenseeRepository,
    contactRepository,
    roomRepository,
    messageRepository,
  })

  return { licenseeRepository, contactRepository, roomRepository, messageRepository, getWidgetMessages }
}

describe('GetWidgetMessages', () => {
  describe('when licensee is not found', () => {
    it('throws an error including the apiToken', async () => {
      const { getWidgetMessages } = buildUseCase()

      await expect(
        getWidgetMessages.execute({ apiToken: 'unknown-token', widgetSessionToken: 'session-abc' }),
      ).rejects.toThrow('Licensee not found for token: unknown-token')
    })
  })

  describe('when widget session token is not found', () => {
    it('throws an error including the widgetSessionToken', async () => {
      const { licenseeRepository, getWidgetMessages } = buildUseCase()

      const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))

      await expect(
        getWidgetMessages.execute({
          apiToken: String(licensee.apiToken),
          widgetSessionToken: 'missing-session',
        }),
      ).rejects.toThrow('Widget session not found: missing-session')
    })
  })

  describe('when no open room exists for the contact', () => {
    it('returns an empty array', async () => {
      const { licenseeRepository, contactRepository, getWidgetMessages } = buildUseCase()

      const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))
      await contactRepository.create(
        contactFactory.build({
          widgetSessionToken: 'session-xyz',
          licensee: licensee._id,
          number: '5511990283745',
        }),
      )

      const result = await getWidgetMessages.execute({
        apiToken: String(licensee.apiToken),
        widgetSessionToken: 'session-xyz',
      })

      expect(result).toEqual([])
    })
  })

  describe('happy path without since filter', () => {
    it('returns all messages in the open room', async () => {
      const { licenseeRepository, contactRepository, roomRepository, messageRepository, getWidgetMessages } =
        buildUseCase()

      const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))
      const contact = await contactRepository.create(
        contactFactory.build({
          widgetSessionToken: 'session-xyz',
          licensee: licensee._id,
          number: '5511990283745',
        }),
      )
      const room = await roomRepository.create(roomFactory.build({ contact: contact._id, closed: false }))

      const msg1 = await messageRepository.create(
        messageFactory.build({ room: room._id, createdAt: new Date('2024-01-01T10:00:00Z') }),
      )
      const msg2 = await messageRepository.create(
        messageFactory.build({ room: room._id, createdAt: new Date('2024-01-01T11:00:00Z') }),
      )

      const result = await getWidgetMessages.execute({
        apiToken: String(licensee.apiToken),
        widgetSessionToken: 'session-xyz',
      })

      expect(result).toHaveLength(2)
      expect(result.map((m: any) => String(m._id))).toEqual(
        expect.arrayContaining([String(msg1._id), String(msg2._id)]),
      )
    })
  })

  describe('happy path with since filter', () => {
    it('returns only messages created after the since timestamp', async () => {
      const { licenseeRepository, contactRepository, roomRepository, messageRepository, getWidgetMessages } =
        buildUseCase()

      const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))
      const contact = await contactRepository.create(
        contactFactory.build({
          widgetSessionToken: 'session-xyz',
          licensee: licensee._id,
          number: '5511990283745',
        }),
      )
      const room = await roomRepository.create(roomFactory.build({ contact: contact._id, closed: false }))

      await messageRepository.create(
        messageFactory.build({ room: room._id, createdAt: new Date('2024-01-01T09:00:00Z') }),
      )
      const newerMsg = await messageRepository.create(
        messageFactory.build({ room: room._id, createdAt: new Date('2024-01-01T11:00:00Z') }),
      )

      const result = await getWidgetMessages.execute({
        apiToken: String(licensee.apiToken),
        widgetSessionToken: 'session-xyz',
        since: new Date('2024-01-01T10:00:00Z'),
      })

      expect(result).toHaveLength(1)
      expect(String(result[0]._id)).toEqual(String(newerMsg._id))
    })
  })
})
