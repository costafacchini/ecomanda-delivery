const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const mongoServer = require('../../../.jest/utils')
const {
  createMessage,
  createMessageToWarnAboutWindowOfWhatsassClosed,
  createTextMessageInsteadInteractive,
} = require('@repositories/message')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')

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
        })
      )
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
        })
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
        })
      )
    })
  })

  describe('#createMessageToWarnAboutWindowOfWhatsassClosed', () => {
    it('creates a message with warn about window of whatsapp to the chat', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())
      const contact = await Contact.create(contactFactory.build({ licensee: licensee._id }))

      const message = await createMessageToWarnAboutWindowOfWhatsassClosed(contact, licensee)

      expect(message).toEqual(
        expect.objectContaining({
          number: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
          kind: 'text',
          text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou.Envie um Template para voltar a interagir com esse contato.',
          destination: 'to-chat',
          licensee,
          contact,
        })
      )
    })
  })
})
