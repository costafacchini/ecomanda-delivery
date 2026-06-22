import { SendWidgetMessage } from './SendWidgetMessage'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { ContactRepositoryMemory } from '@repositories/contact'
import { MessageRepositoryMemory } from '@repositories/message'
import { RoomRepositoryMemory } from '@repositories/room'
import { LocalChat } from '../../plugins/chats/LocalChat'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'

jest.mock('../../services/socketEmitter', () => ({
  emitToLicensee: jest.fn(),
}))

function buildDependencies() {
  const licenseeRepository = new LicenseeRepositoryMemory()
  const contactRepository = new ContactRepositoryMemory()
  const messageRepository = new MessageRepositoryMemory()
  const roomRepository = new RoomRepositoryMemory()
  const useCase = new SendWidgetMessage({ licenseeRepository, contactRepository, messageRepository, roomRepository })
  return { licenseeRepository, contactRepository, messageRepository, roomRepository, useCase }
}

describe('SendWidgetMessage', () => {
  describe('licensee validation', () => {
    it('throws when no licensee matches the apiToken', async () => {
      const { useCase } = buildDependencies()

      await expect(
        useCase.execute({ apiToken: 'unknown-token', widgetSessionToken: 'sess-123', text: 'Hello' }),
      ).rejects.toThrow('unknown-token')
    })
  })

  describe('contact validation', () => {
    it('throws when no contact matches the widgetSessionToken', async () => {
      const { licenseeRepository, useCase } = buildDependencies()

      const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'valid-token' }))

      await expect(
        useCase.execute({ apiToken: 'valid-token', widgetSessionToken: 'missing-session', text: 'Hello' }),
      ).rejects.toThrow('missing-session')

      // suppress unused variable warning
      expect(licensee).toBeDefined()
    })
  })

  describe('happy path', () => {
    it('creates a Message and calls LocalChat.sendMessage with the message _id', async () => {
      const { licenseeRepository, contactRepository, useCase } = buildDependencies()

      const licensee = await licenseeRepository.create(licenseeFactory.build({ apiToken: 'tok-abc' }))
      const contact = await contactRepository.create(
        contactFactory.build({ widgetSessionToken: 'sess-xyz', licensee: licensee._id }),
      )

      const sendMessageSpy = jest.spyOn(LocalChat.prototype, 'sendMessage').mockResolvedValue(undefined)

      const message = await useCase.execute({ apiToken: 'tok-abc', widgetSessionToken: 'sess-xyz', text: 'Hi!' })

      expect(message).toBeDefined()
      expect(message.text).toEqual('Hi!')
      expect(message.destination).toEqual('to-chat')
      expect(message.kind).toEqual('text')
      expect(sendMessageSpy).toHaveBeenCalledWith(message._id)

      sendMessageSpy.mockRestore()

      // suppress unused variable warning
      expect(contact).toBeDefined()
    })
  })
})
