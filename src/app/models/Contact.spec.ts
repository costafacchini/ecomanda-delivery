import Contact from '@models/Contact'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('Contact', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const contact = await Contact.create(contactFactory.build({ licensee }))

      expect(contact._id).not.toEqual(null)
    })

    it('does not changes _id if contact is changed', async () => {
      const contact = await Contact.create(contactFactory.build({ licensee }))

      contact.talkingWithChatBot = true
      const alteredContact = await contact.save()

      expect(contact._id).toEqual(alteredContact._id)
      expect(alteredContact.talkingWithChatBot).toEqual(true)
    })

    it('normalizes the phone number if number contains @', async () => {
      const contact = await Contact.create(
        contactFactory.build({ licensee, number: '5511990283745@c.us', type: 'g.us' }),
      )

      expect(contact.number).toEqual('5511990283745')
      expect(contact.type).toEqual('@c.us')
    })

    it('normalizes the phone number if type is not filled', async () => {
      const contact = await Contact.create(
        contactFactory.build({
          licensee,
          number: '5511902837-4598687665@g.us',
        }),
      )

      expect(contact.number).toEqual('5511902837-4598687665')
      expect(contact.type).toEqual('@g.us')
    })

    describe('web type', () => {
      it('saves number unchanged when type is web', async () => {
        const contact = await Contact.create(
          contactFactory.build({ licensee, number: '11999990000', type: 'web', talkingWithChatBot: false }),
        )

        expect(contact.number).toEqual('11999990000')
        expect(contact.type).toEqual('web')
      })

      it('saves without error for any number when type is web', async () => {
        const contact = await Contact.create(
          contactFactory.build({ licensee, number: '00000000000', type: 'web', talkingWithChatBot: false }),
        )

        expect(contact.number).toEqual('00000000000')
        expect(contact.type).toEqual('web')
      })

      it('persists widgetSessionToken when provided', async () => {
        const token = 'abc-session-token-123'
        const contact = await Contact.create(
          contactFactory.build({ licensee, type: 'web', talkingWithChatBot: false, widgetSessionToken: token }),
        )

        expect(contact.widgetSessionToken).toEqual(token)
      })

      it('still normalizes phone and type for regular whatsapp contacts (regression)', async () => {
        const contact = await Contact.create(
          contactFactory.build({ licensee, number: '5511990283745@c.us', type: 'g.us' }),
        )

        expect(contact.number).toEqual('5511990283745')
        expect(contact.type).toEqual('@c.us')
      })
    })
  })

  describe('validations', () => {
    describe('number', () => {
      it('is required', async () => {
        const contact = new Contact({ name: 'Contact' })
        const validation = await contact.validate().catch((e: any) => e)

        expect(validation.errors['number'].message).toEqual('Numero: Você deve preencher o campo')
      })

      it('normalizes the number and type', async () => {
        const contact = await Contact.create(contactFactory.build({ licensee, number: '5538209234582@c.us' }))

        expect(contact.number).toEqual('5538209234582')
        expect(contact.type).toEqual('@c.us')
      })
    })

    describe('licensee', () => {
      it('is required', async () => {
        const contact = new Contact({ number: '7849342387' })
        const validation = await contact.validate().catch((e: any) => e)

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })

    describe('talkingWithChatBot', () => {
      it('is required', async () => {
        const contact = new Contact({ number: '7849342387' })
        const validation = await contact.validate().catch((e: any) => e)

        expect(validation.errors['talkingWithChatBot'].message).toEqual(
          'Talking with chatbot: Você deve preencher o campo',
        )
      })
    })
  })
})
