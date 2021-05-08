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
        licensee: licensee,
        destination: 'to-chat'
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
        licensee: licensee,
        destination: 'to-chat'
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
      expect(message.kind).toEqual('text')
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
      it('is required if kind is text', () => {
        const message = new Message({ number: '87216', kind: 'text' })
        const validation = message.validateSync()

        expect(validation.errors['text'].message).toEqual('Texto: deve ser preenchido quando o tipo de mensahem é texto')
      })

      it('is not required if kind is not text', () => {
        const message = new Message({ number: '87216', kind: 'file' })
        const validation = message.validateSync()

        expect(validation.errors['text']).not.toBeDefined()
      })
    })

    describe('url', () => {
      it('is required if kind is file', () => {
        const message = new Message({ number: '87216', kind: 'file' })
        const validation = message.validateSync()

        expect(validation.errors['url'].message).toEqual('URL do arquivo: deve ser preenchido quando o tipo de mensagem é arquivo')
      })

      it('is not required if kind is not file', () => {
        const message = new Message({ number: '87216', kind: 'text' })
        const validation = message.validateSync()

        expect(validation.errors['url']).not.toBeDefined()
      })
    })

    describe('fileName', () => {
      it('is required if kind is file', () => {
        const message = new Message({ number: '87216', kind: 'file' })
        const validation = message.validateSync()

        expect(validation.errors['fileName'].message).toEqual('Nome do arquivo: deve ser preenchido quando o tipo de mensagem é arquivo')
      })

      it('is not required if kind is not file', () => {
        const message = new Message({ number: '87216', kind: 'text' })
        const validation = message.validateSync()

        expect(validation.errors['fileName']).not.toBeDefined()
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

    describe('kink', () => {
      it('accepts "text", "file" and "location" values', () => {
        let validation
        const message = new Message()

        message.kind = 'text'
        validation = message.validateSync()

        expect(validation.errors['kind']).not.toBeDefined()

        message.kind = 'file'
        validation = message.validateSync()

        expect(validation.errors['kind']).not.toBeDefined()

        message.licenseKind = 'location'
        validation = message.validateSync()

        expect(validation.errors['kind']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const message = new Message({ kind: 'some' })
        const validation = message.validateSync()

        expect(validation.errors['kind'].message).toEqual(
          '`some` is not a valid enum value for path `kind`.'
        )
      })
    })

    describe('destination', () => {
      it('is required', () => {
        const message = new Message()
        const validation = message.validateSync()

        expect(validation.errors['destination'].message).toEqual(
          'Destino: Você deve informar qual o destino da mensagem (to-chatbot | to-chat | to-messenger)'
        )
      })

      it('accepts "to-chatbot", "to-chat" and "to-messenger" values', () => {
        let validation
        const message = new Message()

        message.destination = 'to-chatbot'
        validation = message.validateSync()

        expect(validation.errors['destination']).not.toBeDefined()

        message.destination = 'to-chat'
        validation = message.validateSync()

        expect(validation.errors['destination']).not.toBeDefined()

        message.destination = 'to-messenger'
        validation = message.validateSync()

        expect(validation.errors['destination']).not.toBeDefined()
      })

      it('does not accepts another values', () => {
        const message = new Message({ destination: 'some' })
        const validation = message.validateSync()

        expect(validation.errors['destination'].message).toEqual(
          '`some` is not a valid enum value for path `destination`.'
        )
      })
    })
  })
})
