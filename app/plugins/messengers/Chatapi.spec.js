const Chatapi = require('./Chatapi')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const fetchMock = require('fetch-mock')
const mongoServer = require('.jest/utils')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Chatapi plugin', () => {
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

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
          messages: [
            {
              id: 'false_5593165392832@c.us_3EB066E484BABD9F3C69',
              body:
                'https://s3.eu-central-1.wasabisys.com/incoming-chat-api/2021/3/25/244959/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
              fromMe: false,
              self: 1,
              isForwarded: 0,
              author: '5593165392832@c.us',
              time: 1616708028,
              chatId: '5593165392832@c.us',
              messageNumber: 111,
              type: 'image',
              senderName: 'John Doe',
              caption: 'Image and text',
              quotedMsgBody: null,
              quotedMsgId: null,
              quotedMsgType: null,
              chatName: 'John Doe',
            },
          ],
          instanceId: '244959',
        }

        const chatapi = new Chatapi(licensee)
        const messages = await chatapi.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual('Image and text')
        expect(messages[0].url).toEqual(
          'https://s3.eu-central-1.wasabisys.com/incoming-chat-api/2021/3/25/244959/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg'
        )
        expect(messages[0].fileName).toEqual('1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
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
          messages: [
            {
              id: 'false_5593165392832@c.us_3EB066E484BABD9F3C69',
              body:
                'https://s3.eu-central-1.wasabisys.com/incoming-chat-api/2021/3/25/244959/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
              fromMe: false,
              self: 1,
              isForwarded: 0,
              author: '5593165392832@c.us',
              time: 1616708028,
              chatId: '5593165392832@c.us',
              messageNumber: 111,
              type: 'image',
              senderName: 'John Doe',
              caption: null,
              quotedMsgBody: null,
              quotedMsgId: null,
              quotedMsgType: null,
              chatName: 'John Doe',
            },
          ],
          instanceId: '244959',
        }

        const chatapi = new Chatapi(licensee)
        const messages = await chatapi.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual(null)
        expect(messages[0].url).toEqual(
          'https://s3.eu-central-1.wasabisys.com/incoming-chat-api/2021/3/25/244959/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg'
        )
        expect(messages[0].fileName).toEqual('1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
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
          messages: [
            {
              id: 'false_5593165392832@c.us_3EB066E484BABD9F3C69',
              body: 'Message to send',
              fromMe: false,
              self: 1,
              isForwarded: 0,
              author: '5593165392832@c.us',
              time: 1616708028,
              chatId: '5593165392832@c.us',
              messageNumber: 111,
              type: 'chat',
              senderName: 'John Doe',
              caption: null,
              quotedMsgBody: null,
              quotedMsgId: null,
              quotedMsgType: null,
              chatName: 'John Doe',
            },
          ],
          instanceId: '244959',
        }

        const chatapi = new Chatapi(licensee)
        const messages = await chatapi.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual('Message to send')
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })
    })

    describe('when the contact does not exists', () => {
      it('registers the contact and return the response body transformed in messages', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const responseBody = {
          messages: [
            {
              id: 'false_5593165392832@c.us_3EB066E484BABD9F3C69',
              body: 'Message to send',
              fromMe: false,
              self: 1,
              isForwarded: 0,
              author: '5593165392832@c.us',
              time: 1616708028,
              chatId: '5593165392832@c.us',
              messageNumber: 111,
              type: 'chat',
              senderName: 'John Doe',
              caption: null,
              quotedMsgBody: null,
              quotedMsgId: null,
              quotedMsgType: null,
              chatName: 'John Doe',
            },
          ],
          instanceId: '244959',
        }

        const chatapi = new Chatapi(licensee)
        const messages = await chatapi.responseToMessages(responseBody)

        const contact = await Contact.findOne({
          number: '5593165392832',
          type: '@c.us',
          licensee: licensee,
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
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
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
          messages: [
            {
              id: 'false_5593165392832@c.us_3EB066E484BABD9F3C69',
              body: 'Message to send',
              fromMe: false,
              self: 1,
              isForwarded: 0,
              author: '5593165392832@c.us',
              time: 1616708028,
              chatId: '5593165392832@c.us',
              messageNumber: 111,
              type: 'chat',
              senderName: 'John Doe',
              caption: null,
              quotedMsgBody: null,
              quotedMsgId: null,
              quotedMsgType: null,
              chatName: 'John Doe',
            },
          ],
          instanceId: '244959',
        }

        const chatapi = new Chatapi(licensee)
        const messages = await chatapi.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].destination).toEqual('to-chatbot')

        expect(messages.length).toEqual(1)
      })
    })

    describe('when the message is from me', () => {
      it('returns the response body transformed in message ignoring the message from me', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const responseBody = {
          messages: [
            {
              id: 'false_5593165392832@c.us_3EB066E484BABD9F3C69',
              body: 'Message to send',
              fromMe: true,
              self: 1,
              isForwarded: 0,
              author: '5593165392832@c.us',
              time: 1616708028,
              chatId: '5593165392832@c.us',
              messageNumber: 111,
              type: 'chat',
              senderName: 'John Doe',
              caption: null,
              quotedMsgBody: null,
              quotedMsgId: null,
              quotedMsgType: null,
              chatName: 'John Doe',
            },
          ],
          instanceId: '244959',
        }

        const chatapi = new Chatapi(licensee)
        const messages = await chatapi.responseToMessages(responseBody)

        expect(messages.length).toEqual(0)
      })
    })

    it('return the empty data if body is blank', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {}

      const chatapi = new Chatapi(licensee)
      const messages = await chatapi.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty data if body does not have messages', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        instanceId: '244959',
      }

      const chatapi = new Chatapi(licensee)
      const messages = await chatapi.responseToMessages(responseBody)

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

        const expectedBodyReadChat = {
          chatId: '5593165392832@c.us',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/readChat?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodyReadChat)
            )
          },
          { status: 200, body: { read: true, message: null, chatId: 'true_5511989187726@c.us_3EB031DE2C36C5598621' } }
        )

        const expectedBodySendMessage = {
          chatId: '5593165392832@c.us',
          body: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/sendMessage?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodySendMessage)
            )
          },
          {
            status: 200,
            body: {
              sent: true,
              message: 'Sent to 5593165392832@c.us',
              id: 'true_5511989187726@c.us_3EB031DE2C36C5598621',
              queueNumber: 4,
            },
          }
        )

        expect(message.sended).toEqual(false)

        const chatapi = new Chatapi(licensee)
        await chatapi.sendMessage(message._id, 'https://eu199.chat-api.com/instance103871/', 'etj4w2rcujdmaq34')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(2)

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

        const expectedBodyReadChat = {
          chatId: '5593165392832@c.us',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/readChat?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodyReadChat)
            )
          },
          { status: 200, body: { read: true, message: null, chatId: 'true_5511989187726@c.us_3EB031DE2C36C5598621' } }
        )

        const expectedBodySendMessage = {
          chatId: '5593165392832@c.us',
          body: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/sendMessage?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodySendMessage)
            )
          },
          {
            status: 200,
            body: {
              sent: true,
              message: 'Sent to 5593165392832@c.us',
              id: 'true_5511989187726@c.us_3EB031DE2C36C5598621',
              queueNumber: 4,
            },
          }
        )

        expect(message.sended).toEqual(false)

        const chatapi = new Chatapi(licensee)
        await chatapi.sendMessage(message._id, 'https://eu199.chat-api.com/instance103871/', 'etj4w2rcujdmaq34')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(2)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 enviada para Chatapi com sucesso! Sent to 5593165392832@c.us'
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

          const expectedBodyReadChat = {
            chatId: '5593165392832@c.us',
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url === 'https://eu199.chat-api.com/instance103871/readChat?token=etj4w2rcujdmaq34' &&
                body === JSON.stringify(expectedBodyReadChat)
              )
            },
            { status: 200, body: { read: true, message: null, chatId: 'true_5511989187726@c.us_3EB031DE2C36C5598621' } }
          )

          const expectedBodySendMessage = {
            chatId: '5593165392832@c.us',
            body: 'https://octodex.github.com/images/dojocat.jpg',
            filename: 'dojocat.jpg',
            caption: 'Message to send',
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url === 'https://eu199.chat-api.com/instance103871/sendFile?token=etj4w2rcujdmaq34' &&
                body === JSON.stringify(expectedBodySendMessage)
              )
            },
            {
              status: 200,
              body: {
                sent: true,
                message: 'Sent to 5593165392832@c.us',
                id: 'true_5511989187726@c.us_3EB031DE2C36C5598621',
                queueNumber: 4,
              },
            }
          )

          expect(message.sended).toEqual(false)

          const chatapi = new Chatapi(licensee)
          await chatapi.sendMessage(message._id, 'https://eu199.chat-api.com/instance103871/', 'etj4w2rcujdmaq34')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)

          expect(consoleInfoSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Chatapi com sucesso! Sent to 5593165392832@c.us'
          )
        })
      })
    })

    describe('when can not read the chat messages', () => {
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

        const expectedBodyReadChat = {
          chatId: '5593165392832@c.us',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/readChat?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodyReadChat)
            )
          },
          { status: 200, body: { read: false, message: null, chatId: 'true_5511989187726@c.us_3EB031DE2C36C5598621' } }
        )

        expect(message.sended).toEqual(false)

        const chatapi = new Chatapi(licensee)
        await chatapi.sendMessage(message._id, 'https://eu199.chat-api.com/instance103871/', 'etj4w2rcujdmaq34')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Não foi possível ler as mensagens na Chatapi {"read":false,"message":null,"chatId":"true_5511989187726@c.us_3EB031DE2C36C5598621"}'
        )
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

        const expectedBodyReadChat = {
          chatId: '5593165392832@c.us',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/readChat?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodyReadChat)
            )
          },
          { status: 200, body: { read: true, message: null, chatId: 'true_5511989187726@c.us_3EB031DE2C36C5598621' } }
        )

        const expectedBodySendMessage = {
          chatId: '5593165392832@c.us',
          body: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/sendMessage?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodySendMessage)
            )
          },
          {
            status: 200,
            body: {
              sent: false,
              message:
                'Wrong chatId format. Please use phone parameter or chatId from message history. chatId has format 5593165392832@c.us or 5593165392832-5593165392832@g.us',
            },
          }
        )

        expect(message.sended).toEqual(false)

        const chatapi = new Chatapi(licensee)
        await chatapi.sendMessage(message._id, 'https://eu199.chat-api.com/instance103871/', 'etj4w2rcujdmaq34')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(2)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 não enviada para Chatapi. {"sent":false,"message":"Wrong chatId format. Please use phone parameter or chatId from message history. chatId has format 5593165392832@c.us or 5593165392832-5593165392832@g.us"}'
        )
      })
    })

    describe('when the message is scheduled by chatapi', () => {
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

        const expectedBodyReadChat = {
          chatId: '5593165392832@c.us',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/readChat?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodyReadChat)
            )
          },
          { status: 200, body: { read: true, message: null, chatId: 'true_5511989187726@c.us_3EB031DE2C36C5598621' } }
        )

        const expectedBodySendMessage = {
          chatId: '5593165392832@c.us',
          body: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://eu199.chat-api.com/instance103871/sendMessage?token=etj4w2rcujdmaq34' &&
              body === JSON.stringify(expectedBodySendMessage)
            )
          },
          {
            status: 200,
            body: {
              sent: true,
              message:
                'Status of the account not equals authenticated. Message to  5593165392832@c.us will be sent after successful auth.',
              id: 'true_5511989187726@c.us_3EB031DE2C36C5598621',
              queueNumber: 4,
            },
          }
        )

        expect(message.sended).toEqual(false)

        const chatapi = new Chatapi(licensee)
        await chatapi.sendMessage(message._id, 'https://eu199.chat-api.com/instance103871/', 'etj4w2rcujdmaq34')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(2)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 enviada para Chatapi com sucesso! Status of the account not equals authenticated. Message to  5593165392832@c.us will be sent after successful auth.'
        )
      })
    })
  })

  describe('.kindToMessageKind', () => {
    it('returns text if kind is chat', () => {
      expect(Chatapi.kindToMessageKind('chat')).toEqual('text')
    })

    it('returns file if kind is image', () => {
      expect(Chatapi.kindToMessageKind('image')).toEqual('file')
    })

    it('returns file if kind is video', () => {
      expect(Chatapi.kindToMessageKind('video')).toEqual('file')
    })

    it('returns file if kind is ppt', () => {
      expect(Chatapi.kindToMessageKind('ppt')).toEqual('file')
    })

    it('returns file if kind is audio', () => {
      expect(Chatapi.kindToMessageKind('audio')).toEqual('file')
    })

    it('returns file if kind is document', () => {
      expect(Chatapi.kindToMessageKind('document')).toEqual('file')
    })

    it('returns location if kind is location', () => {
      expect(Chatapi.kindToMessageKind('location')).toEqual('location')
    })
  })

  describe('.action', () => {
    it('returns send-message-to-chat if message destination is to chat', () => {
      expect(Chatapi.action('to_chat')).toEqual('send-message-to-chat')
    })

    it('returns send-message-to-chatbot if message destination is to chatbot', () => {
      expect(Chatapi.action('to_chatbot')).toEqual('send-message-to-chatbot')
    })
  })
})
