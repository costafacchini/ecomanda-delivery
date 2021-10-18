const Winzap = require('./Winzap')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const fetchMock = require('fetch-mock')
const mongoServer = require('../../../../.jest/utils')
const S3 = require('../storage/S3')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Winzap plugin', () => {
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()
  const uploadFileS3Spy = jest.spyOn(S3.prototype, 'uploadFile').mockImplementation()
  const presignedUrlS3Spy = jest.spyOn(S3.prototype, 'presignedUrl').mockImplementation(() => {
    return 'https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg'
  })

  beforeEach(async () => {
    jest.clearAllMocks()
    fetchMock.reset()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#responseToMessages', () => {
    describe('image and text', () => {
      it('returns the response body transformed in messages with only text message', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5593165392832',
          'contact[name]': 'John Doe',
          'contact[server]': 'c.us',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'i',
          'chat[type]': 'image',
          'chat[body]': '/9j/4AAQSkZJRgABAQAAAQABAAD/2w',
          'chat[fn]': '0066D2AD6074747C6EC40601451B9614.jpg',
          ack: '-1',
          caption: 'Message to send',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual('Message to send')
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })
    })

    describe('image', () => {
      it('returns the response body transformed in messages', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          event: 'file',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          fn: '1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
          blob: 'data:image/jpeg;base64,/9j/4AAQSkZJRgA...',
          dir: 'i',
          user: '5511940650658',
          number: '5593165392832',
          uid: '3EB016638A2AD49A9ECE',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual('https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].fileName).toEqual('1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
        expect(uploadFileS3Spy).toHaveBeenCalledTimes(1)
        expect(presignedUrlS3Spy).toHaveBeenCalledTimes(1)
      })
    })

    describe('text', () => {
      it('returns the response body transformed in messages', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5593165392832',
          'contact[name]': 'John Doe',
          'contact[server]': 'c.us',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'i',
          'chat[type]': 'chat',
          'chat[body]': 'Message to send',
          ack: '-1',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual('Message to send')
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })
    })

    describe('group', () => {
      it('returns the response body transformed in messages', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'Grupo Teste',
          number: '5511989187726-1622497000@g.us',
          type: '@g.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5593165392832',
          'contact[name]': 'John Doe',
          'contact[server]': 'g.us',
          'contact[groupName]': 'Grupo Teste',
          'contact[groupNumber]': '5511989187726-1622497000',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'i',
          'chat[type]': 'chat',
          'chat[body]': 'Message to send',
          ack: '-1',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual('Message to send')
        expect(messages[0].senderName).toEqual('John Doe')
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })
    })

    describe('ack', () => {
      it('returns the response body transformed in message ignoring the message from me', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const responseBody = {
          event: 'ack',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        expect(messages.length).toEqual(0)
      })
    })

    it('updates the contact if contact exists, name is different and message is not file', async () => {
      const licensee = await Licensee.create({
        name: 'Alcateia Ltds',
        active: true,
        licenseKind: 'demo',
        useChatbot: true,
        chatbotDefault: 'landbot',
        chatbotUrl: 'https://teste-url.com',
        chatbotAuthorizationToken: 'nakhakbagfrsg',
      })

      await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      const responseBody = {
        event: 'chat',
        token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
        user: '5511940650658',
        'contact[number]': '5593165392832',
        'contact[name]': 'Jonny Cash',
        'contact[server]': 'c.us',
        'chat[dtm]': '1603582444',
        'chat[uid]': '3EB016638A2AD49A9ECE',
        'chat[dir]': 'i',
        'chat[type]': 'chat',
        'chat[body]': 'Message to send',
        ack: '-1',
      }

      const winzap = new Winzap(licensee)
      await winzap.responseToMessages(responseBody)

      const contactUpdated = await Contact.findOne({
        number: '5593165392832',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.name).toEqual('Jonny Cash')
      expect(contactUpdated.talkingWithChatBot).toEqual(true)
    })

    it('does not update the contact if contact exists, name is different and message is file', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      const responseBody = {
        event: 'file',
        token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
        fn: '1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
        blob: 'data:image/jpeg;base64,/9j/4AAQSkZJRgA...',
        dir: 'i',
        user: '5511940650658',
        number: '5593165392832',
        uid: '3EB016638A2AD49A9ECE',
      }

      const winzap = new Winzap(licensee)
      await winzap.responseToMessages(responseBody)

      const contactUpdated = await Contact.findOne({
        number: '5593165392832',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.name).toEqual('John Doe')
    })

    describe('when the contact does not exists', () => {
      it('registers the contact and return the response body transformed in messages', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5593165392832',
          'contact[name]': 'John Doe',
          'contact[server]': 'c.us',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'i',
          'chat[type]': 'chat',
          'chat[body]': 'Message to send',
          ack: '-1',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        const contact = await Contact.findOne({
          number: '5593165392832',
          type: '@c.us',
          licensee: licensee._id,
        })

        expect(contact.name).toEqual('John Doe')
        expect(contact.number).toEqual('5593165392832')
        expect(contact.type).toEqual('@c.us')
        expect(contact.talkingWithChatBot).toEqual(licensee.useChatbot)
        expect(contact.licensee).toEqual(licensee._id)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual('Message to send')
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })

      it('registers the contact with number at name and return the response body transformed in messages if message is file', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const responseBody = {
          event: 'file',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          fn: '1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
          blob: 'data:image/jpeg;base64,/9j/4AAQSkZJRgA...',
          dir: 'i',
          user: '5511940650658',
          number: '5593165392832',
          uid: '3EB016638A2AD49A9ECE',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        const contact = await Contact.findOne({
          number: '5593165392832',
          type: '@c.us',
          licensee: licensee._id,
        })

        expect(contact.name).toEqual('5593165392832')
        expect(contact.number).toEqual('5593165392832')
        expect(contact.type).toEqual('@c.us')
        expect(contact.talkingWithChatBot).toEqual(licensee.useChatbot)
        expect(contact.licensee).toEqual(licensee._id)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual('https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].fileName).toEqual('1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })
    })

    describe('when the contact talking with chatbot', () => {
      it('returns the response body transformed in message with destination "to_chatbot"', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: true,
          licensee: licensee,
        })

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5593165392832',
          'contact[name]': 'John Doe',
          'contact[server]': 'c.us',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'i',
          'chat[type]': 'chat',
          'chat[body]': 'Message to send',
          ack: '-1',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].destination).toEqual('to-chatbot')

        expect(messages.length).toEqual(1)
      })
    })

    describe('when the message is from me', () => {
      it('returns the response body transformed in message ignoring the message from me', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '554899290123',
          'contact[name]': 'John Doe',
          'contact[server]': 'c.us',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'o',
          'chat[type]': 'chat',
          'chat[body]': 'Teste',
          ack: '-1',
        }

        const winzap = new Winzap(licensee)
        const messages = await winzap.responseToMessages(responseBody)

        expect(messages.length).toEqual(0)
      })
    })

    it('return the empty data if body is blank', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {}

      const winzap = new Winzap(licensee)
      const messages = await winzap.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty data if event is chat and chat type is not chat and has no caption', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        event: 'chat',
        'chat[type]': 'file',
      }

      const winzap = new Winzap(licensee)
      const messages = await winzap.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })
  })

  describe('#sendMessage', () => {
    describe('when the message was sent', () => {
      it('marks the message with was sent', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832',
          type: '@c.us',
          email: 'john@doe.com',
          talkingWithChatBot: true,
          licensee: licensee,
        })

        const message = await Message.create({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          number: 'jhd7879a7d9',
          contact: contact,
          licensee: licensee,
          destination: 'to-messenger',
          sended: false,
        })

        const expectedBody = {
          token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
          cmd: 'chat',
          id: '60958703f415ed4008748637',
          to: '5593165392832@c.us',
          msg: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return url === 'https://api.winzap.com.br/send/' && body === JSON.stringify(expectedBody)
          },
          {
            status: 200,
            body: {
              type: 'send message',
              cmd: 'chat',
              to: '5593165392832@c.us',
              token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
              servidor: 'res_winzap',
            },
          }
        )

        expect(message.sended).toEqual(false)

        const winzap = new Winzap(licensee)
        await winzap.sendMessage(message._id, 'https://api.winzap.com.br/send/', 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await Message.findById(message._id)
        expect(messageUpdated.sended).toEqual(true)
      })

      it('logs the success message', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832',
          type: '@c.us',
          email: 'john@doe.com',
          talkingWithChatBot: true,
          licensee: licensee,
        })

        const message = await Message.create({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          number: 'jhd7879a7d9',
          contact: contact,
          licensee: licensee,
          destination: 'to-messenger',
          sended: false,
        })

        const expectedBody = {
          token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
          cmd: 'chat',
          id: '60958703f415ed4008748637',
          to: '5593165392832@c.us',
          msg: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return url === 'https://api.winzap.com.br/send/' && body === JSON.stringify(expectedBody)
          },
          {
            status: 200,
            body: {
              type: 'send message',
              cmd: 'chat',
              to: '5593165392832@c.us',
              token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
              servidor: 'res_winzap',
            },
          }
        )

        expect(message.sended).toEqual(false)

        const winzap = new Winzap(licensee)
        await winzap.sendMessage(message._id, 'https://api.winzap.com.br/send/', 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 enviada para Winzap com sucesso! {"type":"send message","cmd":"chat","to":"5593165392832@c.us","token":"WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K","servidor":"res_winzap"}'
        )
      })

      describe('when the message is file', () => {
        it('marks the message with sended and log the success message', async () => {
          const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

          const contact = await Contact.create({
            name: 'John Doe',
            number: '5593165392832',
            type: '@c.us',
            email: 'john@doe.com',
            talkingWithChatBot: true,
            licensee: licensee,
          })

          const message = await Message.create({
            _id: '60958703f415ed4008748637',
            number: 'jhd7879a7d9',
            contact: contact,
            licensee: licensee,
            destination: 'to-messenger',
            text: 'Message to send',
            kind: 'file',
            url: 'https://octodex.github.com/images/dojocat.jpg',
            fileName: 'dojocat.jpg',
            sended: false,
          })

          const expectedBody = {
            token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
            cmd: 'media',
            id: '60958703f415ed4008748637',
            to: '5593165392832@c.us',
            msg: 'Message to send',
            link: 'https://octodex.github.com/images/dojocat.jpg',
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return url === 'https://api.winzap.com.br/send/' && body === JSON.stringify(expectedBody)
            },
            {
              status: 200,
              body: {
                type: 'send message',
                cmd: 'chat',
                to: '5593165392832@c.us',
                token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
                servidor: 'res_winzap',
              },
            }
          )

          expect(message.sended).toEqual(false)

          const winzap = new Winzap(licensee)
          await winzap.sendMessage(
            message._id,
            'https://api.winzap.com.br/send/',
            'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K'
          )
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)

          expect(consoleInfoSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Winzap com sucesso! {"type":"send message","cmd":"chat","to":"5593165392832@c.us","token":"WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K","servidor":"res_winzap"}'
          )
        })
      })
    })

    describe('when can not send the message', () => {
      it('logs the error message', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832',
          type: '@c.us',
          email: 'john@doe.com',
          talkingWithChatBot: true,
          licensee: licensee,
        })

        const message = await Message.create({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          number: 'jhd7879a7d9',
          contact: contact,
          licensee: licensee,
          destination: 'to-messenger',
          sended: false,
        })

        const expectedBody = {
          token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
          cmd: 'chat',
          id: '60958703f415ed4008748637',
          to: '5593165392832@c.us',
          msg: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return url === 'https://api.winzap.com.br/send/' && body === JSON.stringify(expectedBody)
          },
          {
            status: 200,
            body: {
              type: 'send message',
              token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
              status: 'whatsapp offline',
            },
          }
        )

        expect(message.sended).toEqual(false)

        const winzap = new Winzap(licensee)
        await winzap.sendMessage(message._id, 'https://api.winzap.com.br/send/', 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await Message.findById(message._id)
        expect(messageUpdated.sended).toEqual(false)
        expect(messageUpdated.error).toEqual(
          '{"type":"send message","token":"WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K","status":"whatsapp offline"}'
        )

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 não enviada para Chatapi. {"type":"send message","token":"WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K","status":"whatsapp offline"}'
        )
      })
    })
  })

  describe('#action', () => {
    it('returns send-message-to-chat if message destination is to chat', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })
      const winzap = new Winzap(licensee)

      expect(winzap.action('to-chat')).toEqual('send-message-to-chat')
    })

    it('returns send-message-to-chatbot if message destination is to chatbot', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })
      const winzap = new Winzap(licensee)

      expect(winzap.action('to-chatbot')).toEqual('send-message-to-chatbot')
    })
  })
})
