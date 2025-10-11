import Trigger from '@models/Trigger'
import Message from '@models/Message'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { triggerText } from '@factories/trigger'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

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
      const messageRepository = new MessageRepositoryDatabase()

      expect(messageRepository.model()).toEqual(Message)
    })
  })

  describe('#create', () => {
    it('creates a new message', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(contactFactory.build({ licensee: licensee._id }))

      const messageRepository = new MessageRepositoryDatabase()
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
        const messageRepository = new MessageRepositoryDatabase()

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

      const messageRepository = new MessageRepositoryDatabase()
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

      const messageRepository = new MessageRepositoryDatabase()
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world' }))
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world' }))
      await messageRepository.create(messageFactory.build({ licensee, contact, text: 'Hello world again' }))

      let result = await messageRepository.find({ text: 'Hello world' })
      expect(result.length).toEqual(2)
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

        const messageRepository = new MessageRepositoryDatabase()
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

        const messageRepository = new MessageRepositoryDatabase()
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

      const messageRepository = new MessageRepositoryDatabase()
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

      const messageRepository = new MessageRepositoryDatabase()
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

      const messageRepository = new MessageRepositoryDatabase()
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

      const messageRepository = new MessageRepositoryDatabase()
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
