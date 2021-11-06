const Landbot = require('./Landbot')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const fetchMock = require('fetch-mock')
const mongoServer = require('../../../../.jest/utils')
const emoji = require('../../helpers/Emoji')
const Room = require('@models/Room')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Landbot plugin', () => {
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()
  const emojiReplaceSpy = jest.spyOn(emoji, 'replace')

  beforeEach(async () => {
    jest.clearAllMocks()
    fetchMock.reset()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#responseToMessages', () => {
    it('returns the response body transformed in messages', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: true,
        licensee: licensee,
      })

      const responseBody = {
        messages: [
          {
            type: 'text',
            timestamp: '1234567890',
            message: 'Hello world',
          },
          {
            type: 'image',
            timestamp: '1234567890',
            url: 'https://octodex.github.com/images/dojocat.jpg',
            message: 'Text with image',
          },
          {
            type: 'multiple_images',
            timestamp: '1234567890',
            urls: [
              'https://octodex.github.com/images/dojocat.jpg',
              'https://www.helloumi.com/wp-content/uploads/2016/07/logo-helloumi-web.png',
            ],
            message: 'Hello',
          },
          {
            type: 'location',
            timestamp: '1234567890',
            latitude: 3.15,
            longitude: 101.75,
            message: 'It is here',
          },
          {
            type: 'dialog',
            timestamp: '1234567890',
            title: 'Hi there',
            buttons: ['Hey', 'Bye'],
            payloads: ['$0', '$1'],
          },
        ],
        customer: {
          id: 2000,
          name: 'John',
          number: '5593165392832',
        },
        agent: {
          id: 1,
          type: 'human',
        },
        channel: {
          id: 100,
          name: 'Android App',
        },
      }

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages[0]).toBeInstanceOf(Message)
      expect(messages[0].licensee).toEqual(licensee._id)
      expect(messages[0].contact).toEqual(contact._id)
      expect(messages[0].kind).toEqual('text')
      expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[0].destination).toEqual('to-messenger')
      expect(messages[0].text).toEqual('Hello world')
      expect(messages[0].url).toEqual(undefined)
      expect(messages[0].fileName).toEqual(undefined)
      expect(messages[0].latitude).toEqual(undefined)
      expect(messages[0].longitude).toEqual(undefined)
      expect(messages[0].departament).toEqual(undefined)

      expect(messages[1]).toBeInstanceOf(Message)
      expect(messages[1].licensee).toEqual(licensee._id)
      expect(messages[1].contact).toEqual(contact._id)
      expect(messages[1].kind).toEqual('file')
      expect(messages[1].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[1].destination).toEqual('to-messenger')
      expect(messages[1].text).toEqual('Text with image')
      expect(messages[1].url).toEqual('https://octodex.github.com/images/dojocat.jpg')
      expect(messages[1].fileName).toEqual('dojocat.jpg')
      expect(messages[1].latitude).toEqual(undefined)
      expect(messages[1].longitude).toEqual(undefined)
      expect(messages[1].departament).toEqual(undefined)

      expect(messages[2]).toBeInstanceOf(Message)
      expect(messages[2].licensee).toEqual(licensee._id)
      expect(messages[2].contact).toEqual(contact._id)
      expect(messages[2].kind).toEqual('location')
      expect(messages[2].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[2].destination).toEqual('to-messenger')
      expect(messages[2].text).toEqual('It is here')
      expect(messages[2].url).toEqual(undefined)
      expect(messages[2].fileName).toEqual(undefined)
      expect(messages[2].latitude).toEqual(3.15)
      expect(messages[2].longitude).toEqual(101.75)
      expect(messages[2].departament).toEqual(undefined)

      expect(emojiReplaceSpy).toHaveBeenCalledTimes(3)
      expect(emojiReplaceSpy).toHaveBeenCalledWith('Hello world')
      expect(emojiReplaceSpy).toHaveBeenCalledWith('Text with image')
      expect(emojiReplaceSpy).toHaveBeenCalledWith('It is here')

      expect(consoleInfoSpy).toHaveBeenCalledTimes(2)
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Tipo de mensagem retornado pela Landbot não reconhecido: multiple_images'
      )
      expect(consoleInfoSpy).toHaveBeenCalledWith('Tipo de mensagem retornado pela Landbot não reconhecido: dialog')

      expect(messages.length).toEqual(3)
    })

    it('changes the landbotId in contact if is different', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: true,
        licensee: licensee,
        landbotId: '123',
      })

      const responseBody = {
        messages: [
          {
            type: 'text',
            timestamp: '1234567890',
            message: 'Hello world',
          },
        ],
        customer: {
          id: 2000,
          name: 'John',
          number: '5593165392832',
        },
        agent: {
          id: 1,
          type: 'human',
        },
        channel: {
          id: 100,
          name: 'Android App',
        },
      }

      const landbot = new Landbot(licensee)
      await landbot.responseToMessages(responseBody)

      const contactUpdated = await Contact.findById(contact._id)
      expect(contactUpdated.landbotId).toEqual('2000')
    })

    it('return the empty array if body is blank', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {}

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty array if body does not have a customer', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        messages: [
          {
            message: 'text',
          },
        ],
      }

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty array if body does not have messages', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        customer: {
          name: 'John Doe',
        },
      }

      const landbot = new Landbot(licensee)
      const messages = await landbot.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })
  })

  describe('#responseTransferToMessage', () => {
    it('returns the response body transformed in message', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: true,
        licensee: licensee,
      })

      const responseBody = {
        number: '5593165392832@c.us',
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
      }

      const landbot = new Landbot(licensee)
      const message = await landbot.responseTransferToMessage(responseBody)

      expect(message).toBeInstanceOf(Message)
      expect(message.licensee).toEqual(licensee._id)
      expect(message.contact).toEqual(contact._id)
      expect(message.kind).toEqual('text')
      expect(message.number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(message.destination).toEqual('to-transfer')
      expect(message.text).toEqual('Message to send chat')
      expect(message.departament).toEqual('100')
      expect(message.url).toEqual(undefined)
      expect(message.fileName).toEqual(undefined)
      expect(message.latitude).toEqual(undefined)
      expect(message.longitude).toEqual(undefined)
    })

    it('return the empty message if number is blank', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
      }

      const landbot = new Landbot(licensee)
      const message = await landbot.responseTransferToMessage(responseBody)

      expect(message).toEqual(undefined)
    })

    it('close room if the body has a iniciar_nova_conversa with true', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: true,
        licensee: licensee,
      })

      const room = await Room.create({
        roomId: 'ka3DiV9CuHD765',
        token: contact._id.toString(),
        contact: contact,
        closed: false,
      })

      const responseBody = {
        number: '5593165392832@c.us',
        observacao: 'Message to send chat',
        id_departamento_rocketchat: '100',
        iniciar_nova_conversa: 'true',
      }

      const landbot = new Landbot(licensee)
      const message = await landbot.responseTransferToMessage(responseBody)

      expect(message).toBeInstanceOf(Message)

      const modifiedRoom = await Room.findById(room._id)
      expect(modifiedRoom.roomId).toEqual('ka3DiV9CuHD765')
      expect(modifiedRoom.closed).toEqual(true)
    })
  })

  describe('#sendMessage', () => {
    describe('when response status is 201', () => {
      it('marks the message with sended', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832',
          type: '@c.us',
          talkingWithChatBot: true,
          licensee: licensee,
        })

        const message = await Message.create({
          text: 'Message to send',
          number: 'jhd7879a7d9',
          contact: contact,
          licensee: licensee,
          destination: 'to-chatbot',
          sended: false,
        })

        const expectedBody = {
          customer: {
            name: 'John Doe',
            number: '5593165392832',
            type: '@c.us',
            licensee: licensee._id,
          },
          message: {
            type: 'text',
            message: 'Message to send',
            payload: '$1',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://url.com.br/5593165392832/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Token token'
            )
          },
          {
            status: 201,
            body: {
              success: true,
              customer: {
                id: 42,
                name: 'John Doe',
                phone: '5593165392832@c.us',
                token: 'token',
              },
            },
          }
        )

        expect(message.sended).toEqual(false)

        const landbot = new Landbot(licensee)
        await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
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
          talkingWithChatBot: true,
          email: 'john@doe.com',
          licensee: licensee,
        })

        const message = await Message.create({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          number: 'jhd7879a7d9',
          contact: contact,
          licensee: licensee,
          destination: 'to-chatbot',
          sended: false,
        })

        const expectedBody = {
          customer: {
            name: 'John Doe',
            number: '5593165392832',
            email: 'john@doe.com',
            type: '@c.us',
            licensee: licensee._id,
          },
          message: {
            type: 'text',
            message: 'Message to send',
            payload: '$1',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://url.com.br/5593165392832/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Token token'
            )
          },
          {
            status: 201,
            body: {
              success: true,
              customer: {
                id: 42,
                name: 'John Doe',
                phone: '5593165392832@c.us',
                email: 'john@doe.com',
                token: 'token',
              },
            },
          }
        )

        const landbot = new Landbot(licensee)
        await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          `Mensagem 60958703f415ed4008748637 enviada para Landbot com sucesso!
           status: 201
           body: ${JSON.stringify({
             success: true,
             customer: {
               id: 42,
               name: 'John Doe',
               phone: '5593165392832@c.us',
               email: 'john@doe.com',
               token: 'token',
             },
           })}`
        )
      })
    })

    describe('when response is not 201', () => {
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
          destination: 'to-chatbot',
          sended: false,
        })

        const expectedBody = {
          customer: {
            name: 'John Doe',
            number: '5593165392832',
            email: 'john@doe.com',
            type: '@c.us',
            licensee: licensee._id,
          },
          message: {
            type: 'text',
            message: 'Message to send',
            payload: '$1',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://url.com.br/5593165392832/' &&
              body === JSON.stringify(expectedBody) &&
              headers['Authorization'] === 'Token token'
            )
          },
          {
            status: 403,
            body: {
              detail: 'invalid token',
            },
          }
        )

        expect(message.sended).toEqual(false)

        const landbot = new Landbot(licensee)
        await landbot.sendMessage(message._id, 'https://url.com.br', 'token')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await Message.findById(message._id)
        expect(messageUpdated.sended).toEqual(false)
        expect(messageUpdated.error).toEqual('{"detail":"invalid token"}')

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Mensagem 60958703f415ed4008748637 não enviada para Landbot.
           status: 403
           mensagem: ${JSON.stringify({ detail: 'invalid token' })}`
        )
      })
    })
  })

  describe('.kindToMessageKind', () => {
    it('returns text if kind is text', () => {
      expect(Landbot.kindToMessageKind('text')).toEqual('text')
    })

    it('returns file if kind is document', () => {
      expect(Landbot.kindToMessageKind('document')).toEqual('file')
    })

    it('returns file if kind is image', () => {
      expect(Landbot.kindToMessageKind('image')).toEqual('file')
    })

    it('returns location if kind is location', () => {
      expect(Landbot.kindToMessageKind('location')).toEqual('location')
    })
  })

  describe('#dropConversation', () => {
    it('send request to delete customer on landbot', async () => {
      const licensee = await Licensee.create({
        name: 'Alcateia Ltds',
        active: true,
        licenseKind: 'demo',
        chatbotApiToken: 'token',
      })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832',
        type: '@c.us',
        talkingWithChatBot: true,
        licensee: licensee,
        landbotId: '20000',
      })

      fetchMock.deleteOnce((url, { headers }) => {
        return url === 'https://api.landbot.io/v1/customers/20000/' && headers['Authorization'] === 'Token token'
      }, 204)

      const landbot = new Landbot(licensee)
      await landbot.dropConversation(contact._id, 'token')
      await fetchMock.flush(true)

      expect(fetchMock.done()).toBe(true)
      expect(fetchMock.calls()).toHaveLength(1)
    })
  })
})
