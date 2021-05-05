const Message = require('@models/Message')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const mongoServer = require('.jest/utils')

describe('Message', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
      const contact = await Contact.create({ number: '551190283745', talkingWithChatBot: false, licensee: licensee })

      const message = await Message.create({
        text: 'Text',
        number: 'Abc012',
        contact: contact,
        licensee: licensee
      })

      expect(message._id).
        not.
        toEqual(null)
    })

    it('does not changes _id if message is changed', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
      const contact = await Contact.create({ number: '551190283745', talkingWithChatBot: false, licensee: licensee })

      const message = await Message.create({
        text: 'Text',
        number: 'Abc012',
        contact: contact,
        licensee: licensee
      })

      message.text = 'Changed'
      const alteredMessage = await message.save()

      expect(message._id).toEqual(alteredMessage._id)
      expect(alteredMessage.text).toEqual('Changed')
    })

    it('fills the fields that have a default value', () => {
      const message = new Message()

      expect(message.fromMe).toEqual(false)
      expect(message.sended).toEqual(false)
    })
  })

  describe('validations', () => {
    describe('number', () => {
      it('is required', () => {
        const message = new Message({ text: 'Text' })
        const validation = message.validateSync()

        expect(validation.errors['number'].message).toEqual('Number: Você deve preencher o campo')
      })
    })

    describe('text', () => {
      it('is required', () => {
        const message = new Message({ number: '87216' })
        const validation = message.validateSync()

        expect(validation.errors['text'].message).toEqual('Text: Você deve preencher o campo')
      })
    })

    describe('contact', () => {
      it('is required', () => {
        const message = new Message({ number: '7887', text: 'Text' })
        const validation = message.validateSync()

        expect(validation.errors['contact'].message).toEqual('Contact: Você deve preencher o campo')
      })
    })

    describe('licensee', () => {
      it('is required', () => {
        const message = new Message({ number: '7387', text: 'Text' })
        const validation = message.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })
  })
})
