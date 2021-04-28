const Contact = require('@models/contact')
const Licensee = require('@models/licensee')
const mongoServer = require('.jest/utils')

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
        licensee: licensee
      })

      expect(contact._id).
        not.
        toEqual(null)
    })

    it('does not changes _id if contact is changed', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      const contact = await Contact.create({
        number: '551190283745',
        talkingWithChatBot: false,
        licensee: licensee
      })

      contact.talkingWithChatBot = true
      const alteredContact = await contact.save()

      expect(contact._id).toEqual(alteredContact._id)
      expect(alteredContact.talkingWithChatBot).toEqual(true)
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

        const contact = await Contact.create({ number: '5538209234582@c.us', licensee: licensee, talkingWithChatBot: true })

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

        expect(validation.errors['talkingWithChatBot'].message).toEqual('Talking with chatbot: Você deve preencher o campo')
      })
    })
  })
})
