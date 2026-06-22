import Trigger from '@models/Trigger'
import Message from '@models/Message'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { triggerText } from '@factories/trigger'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase, MessageRepositoryMemory } from '@repositories/message'
import { RoomRepositoryDatabase } from '@repositories/room'
import { room as roomFactory } from '@factories/room'

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))
import { createRuntimeDependencies } from '../runtime/dependencies'

const dependencies = createRuntimeDependencies()

describe('message repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })

      expect(messageRepository.model()).toEqual(Message)
    })
  })

  describe('#create', () => {
    it('creates a new message', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

      const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
      const message = await messageRepository.create({
        destination: 'to-chatbot',
        kind: 'text',
        text: 'Hello World',
        contact,
        licensee,
      })

      expect(message).toEqual(
        expect.objectContaining({
          number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
          kind: 'text',
          text: 'Hello World',
          destination: 'to-chatbot',
          licensee,
          contact,
        }),
      )
    })

    describe('when is invalid message', () => {
      it('generate exception with error', async () => {
        const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })

        await expect(async () => {
          await messageRepository.create()
        }).rejects.toThrow(
          'Message validation failed: contact: Contact: Você deve preencher o campo, licensee: Licensee: Você deve preencher o campo, destination: Destino: Você deve informar qual o destino da mensagem (to-chatbot | to-chat | to-messenger | to-transfer), text: Texto: deve ser preenchido quando o tipo de mensahem é texto',
        )
      })
    })
  })

  describe('#findFirst', () => {
    it('finds a licensee', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

      const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world' }))
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world' }))
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world again' }))

      let result = await messageRepository.findFirst()
      expect(result).toEqual(expect.objectContaining({ text: 'Hello world' }))

      result = await messageRepository.findFirst({ text: 'Hello world again' })
      expect(result).toEqual(expect.objectContaining({ text: 'Hello world again' }))
    })
  })

  describe('#find', () => {
    it('finds messages', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

      const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world' }))
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world' }))
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world again' }))

      let result = await messageRepository.find({ text: 'Hello world' })
      expect(result.length).toEqual(2)
    })
  })

  describe('#findByRoom', () => {
    describe('MessageRepositoryDatabase', () => {
      it('returns messages for the room in ascending createdAt order', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

        const roomRepository = new RoomRepositoryDatabase()
        const room = await roomRepository.create(roomFactory.build({ contact: contact._id }))

        const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
        const msg1 = await messageRepository.create(
          messageFactory.build({ licensee, contact, room: room._id, text: 'first', createdAt: new Date('2024-01-01T10:00:00Z') }),
        )
        const msg2 = await messageRepository.create(
          messageFactory.build({ licensee, contact, room: room._id, text: 'second', createdAt: new Date('2024-01-01T11:00:00Z') }),
        )

        const result = await messageRepository.findByRoom(room._id)

        expect(result.length).toEqual(2)
        expect(result[0]._id.toString()).toEqual(msg1._id.toString())
        expect(result[1]._id.toString()).toEqual(msg2._id.toString())
      })

      it('returns empty array when no messages exist for the room', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

        const roomRepository = new RoomRepositoryDatabase()
        const room = await roomRepository.create(roomFactory.build({ contact: contact._id }))

        const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })

        const result = await messageRepository.findByRoom(room._id)

        expect(result).toEqual([])
      })

      it('does not return messages from a different room', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

        const roomRepository = new RoomRepositoryDatabase()
        const roomA = await roomRepository.create(roomFactory.build({ contact: contact._id }))
        const roomB = await roomRepository.create(roomFactory.build({ contact: contact._id }))

        const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
        await messageRepository.create(messageFactory.build({ licensee, contact, room: roomA._id, text: 'room A message' }))

        const result = await messageRepository.findByRoom(roomB._id)

        expect(result).toEqual([])
      })

      it('filters messages by since option', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

        const roomRepository = new RoomRepositoryDatabase()
        const room = await roomRepository.create(roomFactory.build({ contact: contact._id }))

        const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
        await messageRepository.create(
          messageFactory.build({ licensee, contact, room: room._id, text: 'old', createdAt: new Date('2024-01-01T09:00:00Z') }),
        )
        const recentMsg = await messageRepository.create(
          messageFactory.build({ licensee, contact, room: room._id, text: 'recent', createdAt: new Date('2024-01-01T11:00:00Z') }),
        )

        const result = await messageRepository.findByRoom(room._id, { since: new Date('2024-01-01T10:00:00Z') })

        expect(result.length).toEqual(1)
        expect(result[0]._id.toString()).toEqual(recentMsg._id.toString())
      })
    })

    describe('MessageRepositoryMemory', () => {
      it('returns messages for the room in ascending createdAt order', async () => {
        const roomId = { _id: { toString: () => 'room-1', _bsontype: undefined } }
        const otherRoomId = { _id: { toString: () => 'room-2', _bsontype: undefined } }

        const mongoose = require('mongoose')
        const rid = new mongoose.Types.ObjectId()
        const otherRid = new mongoose.Types.ObjectId()

        const msg1 = { _id: new mongoose.Types.ObjectId(), room: rid, text: 'first', createdAt: new Date('2024-01-01T10:00:00Z') }
        const msg2 = { _id: new mongoose.Types.ObjectId(), room: rid, text: 'second', createdAt: new Date('2024-01-01T11:00:00Z') }
        const msg3 = { _id: new mongoose.Types.ObjectId(), room: otherRid, text: 'other', createdAt: new Date('2024-01-01T09:00:00Z') }

        const messageRepository = new MessageRepositoryMemory({ items: [msg2, msg1, msg3] })

        const result = await messageRepository.findByRoom(rid)

        expect(result.length).toEqual(2)
        expect(result[0]._id.toString()).toEqual(msg1._id.toString())
        expect(result[1]._id.toString()).toEqual(msg2._id.toString())
      })

      it('returns empty array when no messages exist for the room', async () => {
        const mongoose = require('mongoose')
        const rid = new mongoose.Types.ObjectId()
        const otherRid = new mongoose.Types.ObjectId()

        const msg = { _id: new mongoose.Types.ObjectId(), room: otherRid, text: 'other', createdAt: new Date() }
        const messageRepository = new MessageRepositoryMemory({ items: [msg] })

        const result = await messageRepository.findByRoom(rid)

        expect(result).toEqual([])
      })

      it('does not return messages from a different room', async () => {
        const mongoose = require('mongoose')
        const roomA = new mongoose.Types.ObjectId()
        const roomB = new mongoose.Types.ObjectId()

        const msg = { _id: new mongoose.Types.ObjectId(), room: roomA, text: 'room A', createdAt: new Date() }
        const messageRepository = new MessageRepositoryMemory({ items: [msg] })

        const result = await messageRepository.findByRoom(roomB)

        expect(result).toEqual([])
      })

      it('filters messages by since option', async () => {
        const mongoose = require('mongoose')
        const rid = new mongoose.Types.ObjectId()

        const oldMsg = { _id: new mongoose.Types.ObjectId(), room: rid, text: 'old', createdAt: new Date('2024-01-01T09:00:00Z') }
        const recentMsg = { _id: new mongoose.Types.ObjectId(), room: rid, text: 'recent', createdAt: new Date('2024-01-01T11:00:00Z') }
        const messageRepository = new MessageRepositoryMemory({ items: [oldMsg, recentMsg] })

        const result = await messageRepository.findByRoom(rid, { since: new Date('2024-01-01T10:00:00Z') })

        expect(result.length).toEqual(1)
        expect(result[0]._id.toString()).toEqual(recentMsg._id.toString())
      })
    })
  })

  describe('#createInteractiveMessages', () => {
    describe('when has trigger with expression equal to text', () => {
      it('creates a list of interactive messages', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))
        const trigger1 = await Trigger.create(
          triggerText.build({ licensee, expression: 'hello_world', text: 'Hello world 1' }),
        )
        const trigger2 = await Trigger.create(
          triggerText.build({ licensee, expression: 'hello_world', text: 'Hello world 2' }),
        )

        const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
        const messages = await messageRepository.createInteractiveMessages({
          destination: 'to-chatbot',
          kind: 'text',
          text: 'hello_world',
          contact,
          licensee,
        })

        expect(messages.length).toEqual(2)
        expect(messages[0]).toEqual(
          expect.objectContaining({
            number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            kind: 'interactive',
            text: 'hello_world',
            destination: 'to-chatbot',
            licensee,
            contact,
            trigger: trigger1._id,
          }),
        )
        expect(messages[1]).toEqual(
          expect.objectContaining({
            number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            kind: 'interactive',
            text: 'hello_world',
            destination: 'to-chatbot',
            licensee,
            contact,
            trigger: trigger2._id,
          }),
        )
      })
    })

    describe('when has no trigger with expression equal to text', () => {
      it('create a list of messages with one text message', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(licenseeFactory.build())

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

        const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
        const messages = await messageRepository.createInteractiveMessages({
          destination: 'to-chatbot',
          kind: 'text',
          text: 'hello_world',
          contact,
          licensee,
        })

        expect(messages.length).toEqual(1)
        expect(messages[0]).toEqual(
          expect.objectContaining({
            number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            kind: 'text',
            text: 'hello_world',
            destination: 'to-chatbot',
            licensee,
            contact,
          }),
        )
      })
    })
  })

  describe('#createTextMessageInsteadInteractive', () => {
    it('creates a message', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

      const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
      const message = await messageRepository.createTextMessageInsteadInteractive({
        destination: 'to-chatbot',
        kind: 'text',
        text: 'Hello World',
        contact,
        licensee,
      })

      expect(message).toEqual(
        expect.objectContaining({
          number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
          kind: 'text',
          text: 'Hello World',
          destination: 'to-chatbot',
          licensee,
          contact,
        }),
      )
    })

    it('creates a message changed text when the message is interactive', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id, name: 'John Doe' }))

      const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
      const message = await messageRepository.createTextMessageInsteadInteractive({
        destination: 'to-chatbot',
        kind: 'interactive',
        text: '$contact_name',
        contact,
        licensee,
      })

      expect(message).toEqual(
        expect.objectContaining({
          number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
          kind: 'text',
          text: 'John Doe',
        }),
      )
    })
  })

  describe('#createMessageToWarnAboutWindowOfWhatsassHasExpired', () => {
    it('creates a message with warn about window of whatsapp to the chat', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

      const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
      const message = await messageRepository.createMessageToWarnAboutWindowOfWhatsassHasExpired(contact, licensee)

      expect(message).toEqual(
        expect.objectContaining({
          number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
          kind: 'text',
          text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou. Envie um Template para voltar a interagir com esse contato.',
          destination: 'to-chat',
          licensee,
          contact,
        }),
      )
    })
  })

  describe('#createMessageToWarnAboutWindowOfWhatsassIsEnding', () => {
    it('creates a message with warn about window of whatsapp to the chat', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

      const messageRepository = new MessageRepositoryDatabase({ parseText: dependencies.parseText })
      const message = await messageRepository.createMessageToWarnAboutWindowOfWhatsassIsEnding(contact, licensee)

      expect(message).toEqual(
        expect.objectContaining({
          number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
          kind: 'text',
          text: '🚨 ATENÇÃO\nO período de 24h para manter conversas está quase expirando. Faltam apenas 10 minutos para encerrar.',
          destination: 'to-chat',
          licensee,
          contact,
        }),
      )
    })
  })
})
