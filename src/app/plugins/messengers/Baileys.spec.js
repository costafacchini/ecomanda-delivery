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
const mockSocketOnWhatsApp = jest.fn()
// Immediately fires connection:open so the sendMessage connection-ready Promise resolves.
const mockSocketEvOn = jest.fn((event, callback) => {
  if (event === 'connection.update') callback({ connection: 'open' })
})

const mockMakeWASocket = jest.fn(() => ({
  sendMessage: mockSocketSendMessage,
  onWhatsApp: mockSocketOnWhatsApp,
  end: mockSocketEnd,
  ev: { on: mockSocketEvOn },
}))

jest.mock('@whiskeysockets/baileys', () => ({
  __esModule: true,
  default: (...args) => mockMakeWASocket(...args),
  initAuthCreds: () => ({ noiseKey: {}, signedIdentityKey: {}, signedPreKey: {}, registrationId: 0, advSecretKey: '' }),
  BufferJSON: { replacer: (_, val) => val, reviver: (_, val) => val },
  Browsers: { ubuntu: () => ['Ubuntu', 'Chrome', '22.04.4'] },
  fetchLatestBaileysVersion: () => ({ version: [2, 3000, 0] }),
}))

// The JID suffix is stripped before NormalizePhone so the stored number is clean (no trailing dot).
const REMOTE_JID = '5511990283745@s.whatsapp.net'
const PARSED_NUMBER = '5511990283745'
const PARSED_WA_ID = '5511990283745'
const PARSED_TYPE = '@c.us'

let dependencies

describe('Baileys plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleWarnSpy = jest.spyOn(global.console, 'warn').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    installMemoryRepositories()
    dependencies = createRuntimeDependencies()
    jest.clearAllMocks()
    mockSocketOnWhatsApp.mockResolvedValue([{ exists: true, jid: `${PARSED_WA_ID}@s.whatsapp.net` }])
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

      it('stores contact number without trailing dot when JID contains @s.whatsapp.net', async () => {
        const body = {
          key: { remoteJid: REMOTE_JID, id: 'BAILEYS-MSG-ID-006' },
          pushName: 'Regression Test',
          message: { conversation: 'no trailing dot' },
        }

        const baileys = new Baileys(licensee, dependencies)
        await baileys.responseToMessages(body)

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.findFirst({ licensee: licensee._id })
        expect(contact.number).not.toMatch(/\.$/)
      })
    })
  })

  describe('#sendMessage', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    async function createContactAndMessage(overrides = {}) {
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
          ...overrides,
        }),
      )
      return { contact, message, messageRepository }
    }

    describe('text message', () => {
      it('sends the message via Baileys socket, sets sended true and stores messageWaId', async () => {
        const { message, messageRepository } = await createContactAndMessage()

        mockSocketSendMessage.mockResolvedValueOnce({ key: { id: 'SENT-MSG-WA-ID' } })

        const baileys = new Baileys(licensee, dependencies)
        const sendPromise = baileys.sendMessage(message._id)
        await jest.runAllTimersAsync()
        await sendPromise

        const updatedMessage = await messageRepository.findFirst({ _id: message._id }, ['contact'])
        expect(updatedMessage.sended).toEqual(true)
        expect(updatedMessage.messageWaId).toEqual('SENT-MSG-WA-ID')
        expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('enviada via Baileys'))
      })

      it('saves error to message and keeps sended false when socket throws', async () => {
        const { message, messageRepository } = await createContactAndMessage()

        mockSocketSendMessage.mockRejectedValueOnce(new Error('Socket connection failed'))

        const baileys = new Baileys(licensee, dependencies)
        await baileys.sendMessage(message._id)

        const updatedMessage = await messageRepository.findFirst({ _id: message._id }, ['contact'])
        expect(updatedMessage.sended).toEqual(false)
        expect(updatedMessage.error).toEqual('Socket connection failed')
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Socket connection failed'))
      })

      it('logs error and returns without sending when message is not found', async () => {
        const baileys = new Baileys(licensee, dependencies)
        await baileys.sendMessage('000000000000000000000000')

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('não encontrada'))
        expect(mockSocketSendMessage).not.toHaveBeenCalled()
      })

      it('logs warning and returns without sending when kind is not supported', async () => {
        const { message } = await createContactAndMessage({ kind: 'location' })

        const baileys = new Baileys(licensee, dependencies)
        await baileys.sendMessage(message._id)

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('não suportado'))
        expect(mockSocketSendMessage).not.toHaveBeenCalled()
      })
    })

    describe('file message', () => {
      it('sends image content for a photo URL', async () => {
        const { message, messageRepository } = await createContactAndMessage({
          kind: 'file',
          url: 'https://example.com/photo.jpg',
          fileName: 'photo.jpg',
          text: 'Look at this',
        })

        mockSocketSendMessage.mockResolvedValueOnce({ key: { id: 'IMG-WA-ID' } })

        const baileys = new Baileys(licensee, dependencies)
        const sendPromise = baileys.sendMessage(message._id)
        await jest.runAllTimersAsync()
        await sendPromise

        expect(mockSocketSendMessage).toHaveBeenCalledWith(expect.any(String), {
          image: { url: 'https://example.com/photo.jpg' },
          caption: 'Look at this',
        })
        const updatedMessage = await messageRepository.findFirst({ _id: message._id })
        expect(updatedMessage.sended).toEqual(true)
      })

      it('sends video content for a video URL', async () => {
        const { message } = await createContactAndMessage({
          kind: 'file',
          url: 'https://example.com/clip.mp4',
          fileName: 'clip.mp4',
          text: 'Watch this',
        })

        mockSocketSendMessage.mockResolvedValueOnce({ key: { id: 'VID-WA-ID' } })

        const baileys = new Baileys(licensee, dependencies)
        const sendPromise = baileys.sendMessage(message._id)
        await jest.runAllTimersAsync()
        await sendPromise

        expect(mockSocketSendMessage).toHaveBeenCalledWith(expect.any(String), {
          video: { url: 'https://example.com/clip.mp4' },
          caption: 'Watch this',
        })
      })

      it('sends document content for a non-media URL', async () => {
        const { message } = await createContactAndMessage({
          kind: 'file',
          url: 'https://example.com/contract.pdf',
          fileName: 'contract.pdf',
          text: '',
        })

        mockSocketSendMessage.mockResolvedValueOnce({ key: { id: 'DOC-WA-ID' } })

        const baileys = new Baileys(licensee, dependencies)
        const sendPromise = baileys.sendMessage(message._id)
        await jest.runAllTimersAsync()
        await sendPromise

        expect(mockSocketSendMessage).toHaveBeenCalledWith(expect.any(String), {
          document: { url: 'https://example.com/contract.pdf' },
          fileName: 'contract.pdf',
          caption: '',
        })
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
      const mockBufferJSON = { replacer: (_, val) => val, reviver: (_, val) => val }

      const baileys = new Baileys(licensee, dependencies)
      await baileys.saveSession(session, creds, keys, mockBufferJSON)

      const updatedSession = await whatsappSessionRepository.findFirst({ _id: session._id })
      expect(updatedSession.creds).toEqual(creds)
      expect(updatedSession.keys).toEqual(keys)
    })
  })
})
