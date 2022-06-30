const Licensee = require('@models/Licensee')
const mongoServer = require('../../../.jest/utils')
const { createContact, contactWithWhatsappWindowClosed } = require('@repositories/contact')
const { createMessage } = require('@repositories/message')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { message: messageFactory } = require('@factories/message')
const moment = require('moment-timezone')

describe('contact repository', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#createContact', () => {
    it('creates a contact', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      const contact = await createContact({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      expect(contact).toEqual(
        expect.objectContaining({
          number: '5511990283745',
          talkingWithChatBot: false,
          licensee,
        })
      )
    })
  })

  describe('#contactWithWhatsappWindowClosed', () => {
    it('returns true if the last message of contact sended to chat is greather than 24 hours', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      const contact = await createContact({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      const now = moment.tz(new Date(), 'UTC')

      await createMessage(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: now.subtract('24', 'hours').subtract('1', 'minutes'),
        })
      )

      await createMessage(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: new Date(2021, 6, 5, 0, 0, 1),
        })
      )

      expect(await contactWithWhatsappWindowClosed(contact.id)).toEqual(true)
    })

    it('returns true if the last message of contact sended to chat is equal 24 hours', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      const contact = await createContact({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      const now = moment.tz(new Date(), 'UTC')

      await createMessage(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: now.subtract('24', 'hours'),
        })
      )

      await createMessage(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: new Date(2021, 6, 5, 0, 0, 1),
        })
      )

      expect(await contactWithWhatsappWindowClosed(contact.id)).toEqual(true)
    })

    it('returns true if the contact has no sended message to chat', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      const contact = await createContact({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      expect(await contactWithWhatsappWindowClosed(contact.id)).toEqual(true)
    })

    it('returns false if the last message of contact sended to chat is less than 24 hours', async () => {
      const licensee = await Licensee.create(licenseeFactory.build())

      const contact = await createContact({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      const now = moment.tz(new Date(), 'UTC')

      await createMessage(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: now.subtract('23', 'hours').subtract('59', 'minutes'),
        })
      )

      await createMessage(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: new Date(2021, 6, 5, 0, 0, 1),
        })
      )

      expect(await contactWithWhatsappWindowClosed(contact.id)).toEqual(false)
    })
  })
})
