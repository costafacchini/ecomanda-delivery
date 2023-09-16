const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const Trigger = require('@models/Trigger')
const mongoServer = require('../../../.jest/utils')
const {
  createMessage,
  createMessageToWarnAboutWindowOfWhatsassHasExpired,
  createMessageToWarnAboutWindowOfWhatsassIsEnding,
  createTextMessageInsteadInteractive,
  createInteractiveMessages,
} = require('@repositories/message')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { triggerText } = require('@factories/trigger')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('message repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#createMessage', () => {
    it('creates a message', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee: licensee._id }))

      const message = await createMessage({
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
  })

  describe('#createInteractiveMessages', () => {
    describe('when has trigger with expression equal to text', () => {
      it('creates a list of interactive messages', async () => {
        const licensee = await Licensee.create(licenseeFactory.build())
        const contact = await Contact.create(contactFactory.build({ licensee: licensee._id }))
        const trigger1 = await Trigger.create(
          triggerText.build({ licensee, expression: 'hello_world', text: 'Hello world 1' }),
        )
        const trigger2 = await Trigger.create(
          triggerText.build({ licensee, expression: 'hello_world', text: 'Hello world 2' }),
        )

        const messages = await createInteractiveMessages({
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
        const licensee = await Licensee.create(licenseeFactory.build())
        const contact = await Contact.create(contactFactory.build({ licensee: licensee._id }))

        const messages = await createInteractiveMessages({
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
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee: licensee._id }))

      const message = await createTextMessageInsteadInteractive({
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
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee: licensee._id, name: 'John Doe' }))

      const message = await createTextMessageInsteadInteractive({
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
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee: licensee._id }))

      const message = await createMessageToWarnAboutWindowOfWhatsassHasExpired(contact, licensee)

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
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee: licensee._id }))

      const message = await createMessageToWarnAboutWindowOfWhatsassIsEnding(contact, licensee)

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
