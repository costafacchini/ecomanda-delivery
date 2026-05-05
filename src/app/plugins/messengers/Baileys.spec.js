import { Baileys } from './Baileys.js'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'
import { WhatsappSessionRepositoryDatabase } from '@repositories/whatsappsession'
import { createRuntimeDependencies } from '../../runtime/dependencies.js'

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

const mockSocketSendMessage = jest.fn()
const mockSocketEnd = jest.fn()
const mockSocketEvOn = jest.fn()

const mockMakeWASocket = jest.fn(() => ({
  sendMessage: mockSocketSendMessage,
  end: mockSocketEnd,
  ev: { on: mockSocketEvOn },
}))

jest.mock('@whiskeysockets/baileys', () => ({
  __esModule: true,
  default: (...args) => mockMakeWASocket(...args),
}))

// The remoteJid '5511990283745@s.whatsapp.net' is processed by NormalizePhone which strips
// non-digit/dot characters and produces '5511990283745.' (trailing dot from the domain part).
// Contacts stored via the Baileys parser will have this number format.
const REMOTE_JID = '5511990283745@s.whatsapp.net'
const PARSED_NUMBER = '5511990283745.'
const PARSED_WA_ID = '5511990283745'
const PARSED_TYPE = '@c.us'

let dependencies

describe('Baileys plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    installMemoryRepositories()
    dependencies = createRuntimeDependencies()
    jest.clearAllMocks()
    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(
      licenseeFactory.build({
        name: 'Alcatraz',
        phone: '99999999999',
        active: true,
        whatsappDefault: 'baileys',
        licenseKind: 'demo',
      }),
    )
  })

  afterEach(() => {
    resetMemoryRepositories()
  })

  describe('#responseToMessages', () => {
    describe('text message', () => {
      it('creates a message record with correct fields when contact already exists', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        // Use number/type as Baileys parser produces — NormalizePhone('…@s.whatsapp.net')
        // yields number '5511990283745.' with trailing dot from the domain stripping
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            number: PARSED_NUMBER,
            type: PARSED_TYPE,
            waId: PARSED_WA_ID,
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const body = {
          key: {
            remoteJid: REMOTE_JID,
            id: 'BAILEYS-MSG-ID-001',
          },
          pushName: 'John Doe',
          message: {
            conversation: 'Hello from Baileys',
          },
        }

        const baileys = new Baileys(licensee, dependencies)
        const messages = await baileys.responseToMessages(body)

        expect(messages.length).toEqual(1)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].text).toEqual('Hello from Baileys')
        expect(messages[0].messageWaId).toEqual('BAILEYS-MSG-ID-001')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
      })

      it('creates a message from extendedTextMessage', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        await contactRepository.create(
          contactFactory.build({
            name: 'Jane Doe',
            number: PARSED_NUMBER,
            type: PARSED_TYPE,
            waId: PARSED_WA_ID,
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const body = {
          key: {
            remoteJid: REMOTE_JID,
            id: 'BAILEYS-MSG-ID-002',
          },
          pushName: 'Jane Doe',
          message: {
            extendedTextMessage: { text: 'Extended text message' },
          },
        }

        const baileys = new Baileys(licensee, dependencies)
        const messages = await baileys.responseToMessages(body)

        expect(messages.length).toEqual(1)
        expect(messages[0].text).toEqual('Extended text message')
        expect(messages[0].kind).toEqual('text')
      })
    })

    describe('unknown/unsupported message type', () => {
      it('returns empty array when body has no key', async () => {
        const baileys = new Baileys(licensee, dependencies)
        const messages = await baileys.responseToMessages({})

        expect(messages).toEqual([])
      })

      it('returns empty array for non-text message (e.g. image without text)', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            number: PARSED_NUMBER,
            type: PARSED_TYPE,
            waId: PARSED_WA_ID,
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const body = {
          key: {
            remoteJid: REMOTE_JID,
            id: 'BAILEYS-MSG-ID-003',
          },
          pushName: 'John Doe',
          message: {
            imageMessage: { url: 'https://example.com/image.jpg' },
          },
        }

        const baileys = new Baileys(licensee, dependencies)
        const messages = await baileys.responseToMessages(body)

        expect(messages).toEqual([])
      })
    })

    describe('contact management', () => {
      it('creates a new contact on first message', async () => {
        const body = {
          key: {
            remoteJid: REMOTE_JID,
            id: 'BAILEYS-MSG-ID-004',
          },
          pushName: 'New Contact',
          message: {
            conversation: 'First message ever',
          },
        }

        const baileys = new Baileys(licensee, dependencies)
        const messages = await baileys.responseToMessages(body)

        expect(messages.length).toEqual(1)

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.findFirst({
          number: PARSED_NUMBER,
          licensee: licensee._id,
        })

        expect(contact).toBeTruthy()
        expect(contact.name).toEqual('New Contact')
        expect(contact.waId).toEqual(PARSED_WA_ID)
      })

      it('updates contact name when it differs from stored name', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'Old Name',
            number: PARSED_NUMBER,
            type: PARSED_TYPE,
            waId: PARSED_WA_ID,
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const body = {
          key: {
            remoteJid: REMOTE_JID,
            id: 'BAILEYS-MSG-ID-005',
          },
          pushName: 'New Name',
          message: {
            conversation: 'Name changed',
          },
        }

        const baileys = new Baileys(licensee, dependencies)
        await baileys.responseToMessages(body)

        const updatedContact = await contactRepository.findFirst({ _id: contact._id })
        expect(updatedContact.name).toEqual('New Name')
      })
    })
  })

  describe('#sendMessage', () => {
    describe('text message', () => {
      it('sends the message via Baileys socket, sets sended true and stores messageWaId', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            number: PARSED_NUMBER,
            type: PARSED_TYPE,
            waId: PARSED_WA_ID,
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            text: 'Hello via Baileys',
            kind: 'text',
            sended: false,
            contact,
            licensee,
            destination: 'to-messenger',
          }),
        )

        mockSocketSendMessage.mockResolvedValueOnce({
          key: { id: 'SENT-MSG-WA-ID' },
        })

        const baileys = new Baileys(licensee, dependencies)
        await baileys.sendMessage(message._id)

        const updatedMessage = await messageRepository.findFirst({ _id: message._id }, ['contact'])
        expect(updatedMessage.sended).toEqual(true)
        expect(updatedMessage.messageWaId).toEqual('SENT-MSG-WA-ID')
        expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('enviada via Baileys'))
      })

      it('saves error to message and keeps sended false when socket throws', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            number: PARSED_NUMBER,
            type: PARSED_TYPE,
            waId: PARSED_WA_ID,
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            text: 'Will fail',
            kind: 'text',
            sended: false,
            contact,
            licensee,
            destination: 'to-messenger',
          }),
        )

        mockSocketSendMessage.mockRejectedValueOnce(new Error('Socket connection failed'))

        const baileys = new Baileys(licensee, dependencies)
        await baileys.sendMessage(message._id)

        const updatedMessage = await messageRepository.findFirst({ _id: message._id }, ['contact'])
        expect(updatedMessage.sended).toEqual(false)
        expect(updatedMessage.error).toEqual('Socket connection failed')
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Socket connection failed'))
      })
    })
  })

  describe('#loadOrCreateSession', () => {
    it('creates a new session when none exists for licensee', async () => {
      const whatsappSessionRepository = new WhatsappSessionRepositoryDatabase()

      const existingSession = await whatsappSessionRepository.findFirst({ licensee: licensee._id })
      expect(existingSession).toBeNull()

      const baileys = new Baileys(licensee, dependencies)
      const session = await baileys.loadOrCreateSession()

      expect(session).toBeTruthy()
      expect(String(session.licensee)).toEqual(String(licensee._id))
    })

    it('returns existing session when one exists for licensee', async () => {
      const whatsappSessionRepository = new WhatsappSessionRepositoryDatabase()
      const created = await whatsappSessionRepository.create({ licensee: licensee._id })

      const baileys = new Baileys(licensee, dependencies)
      const session = await baileys.loadOrCreateSession()

      expect(String(session._id)).toEqual(String(created._id))
    })
  })

  describe('#saveSession', () => {
    it('persists updated creds and keys on the session', async () => {
      const whatsappSessionRepository = new WhatsappSessionRepositoryDatabase()
      const session = await whatsappSessionRepository.create({ licensee: licensee._id })

      const creds = { registered: true, me: { id: '5511999999999' } }
      const keys = { 'pre-key': { 1: 'key-data' } }

      const baileys = new Baileys(licensee, dependencies)
      await baileys.saveSession(session, creds, keys)

      const updatedSession = await whatsappSessionRepository.findFirst({ _id: session._id })
      expect(updatedSession.creds).toEqual(creds)
      expect(updatedSession.keys).toEqual(keys)
    })
  })
})
