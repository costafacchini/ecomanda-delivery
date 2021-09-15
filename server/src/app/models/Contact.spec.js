const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const mongoServer = require('../../../.jest/utils')

describe('Contact', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      const contact = await Contact.create({
        number: '551190283745',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      expect(contact._id).not.toEqual(null)
    })

    it('does not changes _id if contact is changed', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      const contact = await Contact.create({
        number: '551190283745',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      contact.talkingWithChatBot = true
      const alteredContact = await contact.save()

      expect(contact._id).toEqual(alteredContact._id)
      expect(alteredContact.talkingWithChatBot).toEqual(true)
    })

    it('normalizes the phone number if number contains @', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      const contact = await Contact.create({
        number: '551190283745@c.us',
        type: 'g.us',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      expect(contact.number).toEqual('5511990283745')
      expect(contact.type).toEqual('@c.us')
    })

    it('normalizes the phone number if type is not filled', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      const contact = await Contact.create({
        number: '5511902837-4598687665@g.us',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      expect(contact.number).toEqual('5511902837-4598687665')
      expect(contact.type).toEqual('@g.us')
    })
  })

  describe('validations', () => {
    describe('number', () => {
      it('is required', () => {
        const contact = new Contact({ name: 'Contact' })
        const validation = contact.validateSync()

        expect(validation.errors['number'].message).toEqual('Numero: Você deve preencher o campo')
      })

      it('normalizes the number and type', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

        const contact = await Contact.create({
          number: '5538209234582@c.us',
          licensee: licensee,
          talkingWithChatBot: true,
        })

        expect(contact.number).toEqual('5538209234582')
        expect(contact.type).toEqual('@c.us')
      })
    })

    describe('licensee', () => {
      it('is required', () => {
        const contact = new Contact({ number: '7849342387' })
        const validation = contact.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })

    describe('talkingWithChatBot', () => {
      it('is required', () => {
        const contact = new Contact({ number: '7849342387' })
        const validation = contact.validateSync()

        expect(validation.errors['talkingWithChatBot'].message).toEqual(
          'Talking with chatbot: Você deve preencher o campo'
        )
      })
    })
  })
})
