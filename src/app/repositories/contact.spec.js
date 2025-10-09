import mongoServer from '../../../.jest/utils.js'
import Contact from '@models/Contact.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { contact as contactFactory   } from '@factories/contact.js'
import { message as messageFactory   } from '@factories/message.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'
import { ContactRepositoryDatabase  } from '@repositories/contact.js'
import { MessageRepositoryDatabase  } from '@repositories/message.js'
import moment from 'moment-timezone'

describe('contact repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const contactRepository = new ContactRepositoryDatabase()

      expect(contactRepository.model()).toEqual(Contact)
    })
  })

  describe('#create', () => {
    it('creates a new contact', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactData = {
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      }

      const contactRepository = new ContactRepositoryDatabase()
      const contactSaved = await contactRepository.create(contactData)

      expect(contactSaved._id).toBeDefined()
      expect(contactSaved.number).toEqual('5511990283745')
      expect(contactSaved.talkingWithChatBot).toEqual(false)
      expect(contactSaved.licensee).toEqual(licensee)
    })

    describe('when is invalid contact', () => {
      it('generate exception with error', async () => {
        const contactRepository = new ContactRepositoryDatabase()

        await expect(async () => {
          await contactRepository.create()
        }).rejects.toThrow(
          'Contact validation failed: licensee: Licensee: Você deve preencher o campo, talkingWithChatBot: Talking with chatbot: Você deve preencher o campo, number: Numero: Você deve preencher o campo',
        )
      })
    })
  })

  describe('#findFirst', () => {
    it('finds a contact', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      await contactRepository.create(
        contactFactory.build({ number: '5511990283745', talkingWithChatBot: true, licensee }),
      )
      await contactRepository.create(
        contactFactory.build({ number: '5511990283745', talkingWithChatBot: false, licensee }),
      )

      let result = await contactRepository.findFirst()
      expect(result).toEqual(expect.objectContaining({ number: '5511990283745' }))

      result = await contactRepository.findFirst({ talkingWithChatBot: false })
      expect(result).toEqual(expect.objectContaining({ number: '5511990283745', talkingWithChatBot: false }))
    })
  })

  describe('#getContactByNumber', () => {
    it('returns one record by filter', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      await contactRepository.create({
        number: '5511990283745',
        talkingWithChatBot: false,
        licensee,
      })

      const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
      await contactRepository.create({
        number: '5511990283745',
        talkingWithChatBot: false,
        licensee: anotherLicensee,
      })

      const contact = await contactRepository.getContactByNumber('11990283745', licensee._id)

      expect(contact).toEqual(
        expect.objectContaining({
          number: '5511990283745',
          licensee: licensee._id,
        }),
      )

      expect(contact).not.toEqual(
        expect.objectContaining({
          number: '5511990283745',
          licensee: anotherLicensee._id,
        }),
      )
    })
  })

  describe('#find', () => {
    it('finds messages', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      await contactRepository.create(
        contactFactory.build({ number: '5511990283745', talkingWithChatBot: true, licensee }),
      )
      await contactRepository.create(
        contactFactory.build({ number: '5511990283745', talkingWithChatBot: false, licensee }),
      )

      let result = await contactRepository.find({ number: '5511990283745' })
      expect(result.length).toEqual(2)

      result = await contactRepository.find({ talkingWithChatBot: false })
      expect(result.length).toEqual(1)
    })
  })

  describe('#contactWithWhatsappWindowClosed', () => {
    it('returns true if the last message of contact sended to chat is greather than 24 hours', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      const now = moment.tz(new Date(), 'UTC')

      const messageRepository = new MessageRepositoryDatabase()
      await messageRepository.create(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: now.subtract('24', 'hours').subtract('1', 'minutes'),
        }),
      )

      await messageRepository.create(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: new Date(2021, 6, 5, 0, 0, 1),
        }),
      )

      expect(await contactRepository.contactWithWhatsappWindowClosed(contact.id)).toEqual(true)
    })

    it('returns true if the last message of contact sended to chat is equal 24 hours', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      const now = moment.tz(new Date(), 'UTC')

      const messageRepository = new MessageRepositoryDatabase()
      await messageRepository.create(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: now.subtract('24', 'hours'),
        }),
      )

      await messageRepository.create(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: new Date(2021, 6, 5, 0, 0, 1),
        }),
      )

      expect(await contactRepository.contactWithWhatsappWindowClosed(contact.id)).toEqual(true)
    })

    it('returns true if the contact has no sended message to chat', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      expect(await contactRepository.contactWithWhatsappWindowClosed(contact.id)).toEqual(true)
    })

    it('returns false if the last message of contact sended to chat is less than 24 hours', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create({
        licensee,
        number: '5511990283745',
        talkingWithChatBot: false,
      })

      const now = moment.tz(new Date(), 'UTC')

      const messageRepository = new MessageRepositoryDatabase()
      await messageRepository.create(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: now.subtract('23', 'hours').subtract('59', 'minutes'),
        }),
      )

      await messageRepository.create(
        messageFactory.build({
          licensee,
          contact,
          destination: 'to-chat',
          createdAt: new Date(2021, 6, 5, 0, 0, 1),
        }),
      )

      expect(await contactRepository.contactWithWhatsappWindowClosed(contact.id)).toEqual(false)
    })
  })
})
