const Rocketchat = require('./Rocketchat')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const fetchMock = require('fetch-mock')
const mongoServer = require('../../../../.jest/utils')
const emoji = require('../../helpers/Emoji')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Rocketchat plugin', () => {
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

  describe('#responseToMessage', () => {
    it('returns the response body transformed in message', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: true,
        licensee: licensee,
        roomId: '4sqv8qitNqhgLdvB4',
      })

      const responseBody = {
        _id: '4sqv8qitNqhgLdvB4',
        type: 'Message',
        messages: [
          {
            msg: 'Hello message',
          },
          {
            attachments: [
              {
                description: 'Message with image',
                title: 'dojocat.jpg',
              },
            ],
            fileUpload: {
              publicFilePath: 'https://octodex.github.com/images/dojocat.jpg',
            },
          },
        ],
      }

      const rocketchat = new Rocketchat(licensee)
      const messages = await rocketchat.responseToMessages(responseBody)

      expect(messages[0]).toBeInstanceOf(Message)
      expect(messages[0].licensee).toEqual(licensee._id)
      expect(messages[0].contact).toEqual(contact._id)
      expect(messages[0].kind).toEqual('text')
      expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[0].destination).toEqual('to-messenger')
      expect(messages[0].text).toEqual('Hello message')
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
      expect(messages[1].text).toEqual('Message with image')
      expect(messages[1].url).toEqual('https://octodex.github.com/images/dojocat.jpg')
      expect(messages[1].fileName).toEqual('dojocat.jpg')
      expect(messages[1].latitude).toEqual(undefined)
      expect(messages[1].longitude).toEqual(undefined)
      expect(messages[1].departament).toEqual(undefined)

      expect(emojiReplaceSpy).toHaveBeenCalledTimes(2)
      expect(emojiReplaceSpy).toHaveBeenCalledWith('Hello message')
      expect(emojiReplaceSpy).toHaveBeenCalledWith('Message with image')

      expect(messages.length).toEqual(2)
    })

    it('return the empty data if body is blank', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {}

      const rocketchat = new Rocketchat(licensee)
      const messages = await rocketchat.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    describe('when the message is LivechatSession', () => {
      it('returns the response body transformed in message to close-chat', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: true,
          licensee: licensee,
          roomId: '4sqv8qitNqhgLdvB4',
        })

        const responseBody = {
          _id: '4sqv8qitNqhgLdvB4',
          type: 'LivechatSession',
          messages: [
            {
              _id: 'ou4LGLFdsi8tynQb3',
              username: 'amanda',
              msg: 'Hello message',
            },
            {
              _id: 'ou4LGLFdsi8tynQb4',
              username: 'amanda',
              msg:
                ' Estou encerrando seu atendimento. Precisando de algo é só nos chamar novamente :) A Bennemann deseja a você um ótimo dia!',
              agentId: 'ZnTJu5mzqdDeaZKoo',
              closingMessage: true,
            },
          ],
        }

        const rocketchat = new Rocketchat(licensee)
        const messages = await rocketchat.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-messenger')
        expect(messages[0].text).toEqual('Chat encerrado pelo agente')
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(emojiReplaceSpy).not.toHaveBeenCalled()

        expect(messages.length).toEqual(1)
      })
    })
  })

  describe('#sendMessage', () => {
    describe('when response status is 200', () => {
      it('marks the message with sended', async () => {
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
          text: 'Message to send',
          number: 'jhd7879a7d9',
          contact: contact,
          licensee: licensee,
          destination: 'to-chatbot',
          sended: false,
        })

        const expectedBodyVisitor = {
          visitor: {
            name: 'John Doe - 5593165392832 - WhatsApp',
            email: 'john@doe.com',
            token: '5593165392832@c.us',
          },
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://rocket.com.br/api/v1/livechat/visitor' && body === JSON.stringify(expectedBodyVisitor)
            )
          },
          {
            status: 200,
            body: {
              visitor: {
                _id: 'Z4pqikNyvjvwksYfE',
                username: 'guest-1208',
                ts: '2021-04-19T10:52:59.481Z',
                _updatedAt: '2021-04-19T10:52:59.483Z',
                name: 'John Doe - 5593165392832 - WhatsApp',
                token: '5593165392832@c.us',
                visitorEmails: [{ address: 'john@doe.com' }],
              },
              success: true,
            },
          }
        )

        fetchMock.getOnce('https://rocket.com.br/api/v1/livechat/room?token=5593165392832@c.us', {
          status: 200,
          body: {
            room: {
              _id: 'HNpDrzmTdJB4Z3TR8',
              msgs: 0,
              usersCount: 1,
              lm: '2021-04-19T10:51:04.027Z',
              fname: '5593165392832 - WhatsApp',
              t: 'l',
              ts: '2021-04-19T10:51:04.027Z',
              v: { _id: 'gwniTTrz84Lc9e7jH', username: 'guest-569', token: '5511942215083@c.us', status: 'online' },
              cl: false,
              open: true,
              waitingResponse: true,
              _updatedAt: '2021-04-19T10:51:04.027Z',
            },
            newRoom: true,
            success: true,
          },
        })

        const expectedBody = {
          token: '5593165392832@c.us',
          rid: 'HNpDrzmTdJB4Z3TR8',
          msg: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return url === 'https://rocket.com.br/api/v1/livechat/message' && body === JSON.stringify(expectedBody)
          },
          {
            status: 200,
            body: {
              message: {
                _id: 'ZNDvoAqpx6dKRTRHr',
                rid: 'HNpDrzmTdJB4Z3TR8',
                msg: 'message',
                token: '5593165392832@c.us',
                alias: 'John Doe - 5593165392832 - WhatsApp',
                ts: '2021-04-19T10:52:59.817Z',
                u: { _id: 'HNpDrzmTdJB4Z3TR8', username: 'guest-1208', name: 'John Doe - 5593165392832 - WhatsApp' },
                _updatedAt: '2021-04-19T10:52:59.905Z',
                mentions: [],
                channels: [],
              },
              success: true,
            },
          }
        )

        expect(message.sended).toEqual(false)

        const rocketchat = new Rocketchat(licensee)
        await rocketchat.sendMessage(message._id, 'https://rocket.com.br')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(3)

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
          destination: 'to-chatbot',
          sended: false,
        })

        const expectedBodyVisitor = {
          visitor: {
            name: 'John Doe - 5593165392832 - WhatsApp',
            email: 'john@doe.com',
            token: '5593165392832@c.us',
          },
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return (
              url === 'https://rocket.com.br/api/v1/livechat/visitor' && body === JSON.stringify(expectedBodyVisitor)
            )
          },
          {
            status: 200,
            body: {
              visitor: {
                _id: 'Z4pqikNyvjvwksYfE',
                username: 'guest-1208',
                ts: '2021-04-19T10:52:59.481Z',
                _updatedAt: '2021-04-19T10:52:59.483Z',
                name: 'John Doe - 5593165392832 - WhatsApp',
                token: '5593165392832@c.us',
                visitorEmails: [{ address: 'john@doe.com' }],
              },
              success: true,
            },
          }
        )

        fetchMock.getOnce('https://rocket.com.br/api/v1/livechat/room?token=5593165392832@c.us', {
          status: 200,
          body: {
            room: {
              _id: 'HNpDrzmTdJB4Z3TR8',
              msgs: 0,
              usersCount: 1,
              lm: '2021-04-19T10:51:04.027Z',
              fname: '5593165392832 - WhatsApp',
              t: 'l',
              ts: '2021-04-19T10:51:04.027Z',
              v: { _id: 'gwniTTrz84Lc9e7jH', username: 'guest-569', token: '5511942215083@c.us', status: 'online' },
              cl: false,
              open: true,
              waitingResponse: true,
              _updatedAt: '2021-04-19T10:51:04.027Z',
            },
            newRoom: true,
            success: true,
          },
        })

        const expectedBody = {
          token: '5593165392832@c.us',
          rid: 'HNpDrzmTdJB4Z3TR8',
          msg: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { body }) => {
            return url === 'https://rocket.com.br/api/v1/livechat/message' && body === JSON.stringify(expectedBody)
          },
          {
            status: 200,
            body: {
              message: {
                _id: 'ZNDvoAqpx6dKRTRHr',
                rid: 'HNpDrzmTdJB4Z3TR8',
                msg: 'message',
                token: '5593165392832@c.us',
                alias: 'John Doe - 5593165392832 - WhatsApp',
                ts: '2021-04-19T10:52:59.817Z',
                u: { _id: 'HNpDrzmTdJB4Z3TR8', username: 'guest-1208', name: 'John Doe - 5593165392832 - WhatsApp' },
                _updatedAt: '2021-04-19T10:52:59.905Z',
                mentions: [],
                channels: [],
              },
              success: true,
            },
          }
        )

        expect(message.sended).toEqual(false)

        const rocketchat = new Rocketchat(licensee)
        await rocketchat.sendMessage(message._id, 'https://rocket.com.br')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(3)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 enviada para Rocketchat com sucesso!'
        )
      })

      describe('when message is for group', () => {
        it('send message formatted to group', async () => {
          const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

          const contact = await Contact.create({
            name: 'Grupo Teste',
            number: '5511989187726-1622497000@g.us',
            type: '@g.us',
            email: 'john@doe.com',
            talkingWithChatBot: true,
            licensee: licensee,
          })

          const message = await Message.create({
            text: 'Message to send',
            number: 'jhd7879a7d9',
            contact: contact,
            licensee: licensee,
            destination: 'to-chatbot',
            senderName: 'John Doe',
            sended: false,
          })

          const expectedBodyVisitor = {
            visitor: {
              name: 'Grupo Teste - 5511989187726-1622497000 - WhatsApp',
              email: 'john@doe.com',
              token: '5511989187726-1622497000@g.us',
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url === 'https://rocket.com.br/api/v1/livechat/visitor' && body === JSON.stringify(expectedBodyVisitor)
              )
            },
            {
              status: 200,
              body: {
                visitor: {
                  _id: 'Z4pqikNyvjvwksYfE',
                  username: 'guest-1208',
                  ts: '2021-04-19T10:52:59.481Z',
                  _updatedAt: '2021-04-19T10:52:59.483Z',
                  name: 'Grupo Teste - 5511989187726-1622497000 - WhatsApp',
                  token: '5511989187726-1622497000@g.us',
                  visitorEmails: [{ address: 'john@doe.com' }],
                },
                success: true,
              },
            }
          )

          fetchMock.getOnce('https://rocket.com.br/api/v1/livechat/room?token=5511989187726-1622497000@g.us', {
            status: 200,
            body: {
              room: {
                _id: 'HNpDrzmTdJB4Z3TR8',
                msgs: 0,
                usersCount: 1,
                lm: '2021-04-19T10:51:04.027Z',
                fname: '5593165392832 - WhatsApp',
                t: 'l',
                ts: '2021-04-19T10:51:04.027Z',
                v: {
                  _id: 'gwniTTrz84Lc9e7jH',
                  username: 'guest-569',
                  token: '5511989187726-1622497000@g.us',
                  status: 'online',
                },
                cl: false,
                open: true,
                waitingResponse: true,
                _updatedAt: '2021-04-19T10:51:04.027Z',
              },
              newRoom: true,
              success: true,
            },
          })

          const expectedBody = {
            token: '5511989187726-1622497000@g.us',
            rid: 'HNpDrzmTdJB4Z3TR8',
            msg: '*John Doe:*\nMessage to send',
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return url === 'https://rocket.com.br/api/v1/livechat/message' && body === JSON.stringify(expectedBody)
            },
            {
              status: 200,
              body: {
                message: {
                  _id: 'ZNDvoAqpx6dKRTRHr',
                  rid: 'HNpDrzmTdJB4Z3TR8',
                  msg: 'message',
                  token: '5511989187726-1622497000@g.us',
                  alias: 'Grupo Teste - 5511989187726-1622497000 - WhatsApp',
                  ts: '2021-04-19T10:52:59.817Z',
                  u: {
                    _id: 'HNpDrzmTdJB4Z3TR8',
                    username: 'guest-1208',
                    name: 'Grupo Teste - 5511989187726-1622497000 - WhatsApp',
                  },
                  _updatedAt: '2021-04-19T10:52:59.905Z',
                  mentions: [],
                  channels: [],
                },
                success: true,
              },
            }
          )

          expect(message.sended).toEqual(false)

          const rocketchat = new Rocketchat(licensee)
          await rocketchat.sendMessage(message._id, 'https://rocket.com.br')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
        })
      })

      describe('when message is file', () => {
        it('send message file', async () => {
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
            text: '',
            kind: 'file',
            number: 'jhd7879a7d9',
            contact: contact,
            licensee: licensee,
            destination: 'to-chatbot',
            sended: false,
            url: 'https://file-url.com',
            fileName: 'file-url',
          })

          const expectedBodyVisitor = {
            visitor: {
              name: 'John Doe - 5593165392832 - WhatsApp',
              email: 'john@doe.com',
              token: '5593165392832@c.us',
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url === 'https://rocket.com.br/api/v1/livechat/visitor' && body === JSON.stringify(expectedBodyVisitor)
              )
            },
            {
              status: 200,
              body: {
                visitor: {
                  _id: 'Z4pqikNyvjvwksYfE',
                  username: 'guest-1208',
                  ts: '2021-04-19T10:52:59.481Z',
                  _updatedAt: '2021-04-19T10:52:59.483Z',
                  name: 'John Doe - 5593165392832 - WhatsApp',
                  token: '5593165392832@c.us',
                  visitorEmails: [{ address: 'john@doe.com' }],
                },
                success: true,
              },
            }
          )

          fetchMock.getOnce('https://rocket.com.br/api/v1/livechat/room?token=5593165392832@c.us', {
            status: 200,
            body: {
              room: {
                _id: 'HNpDrzmTdJB4Z3TR8',
                msgs: 0,
                usersCount: 1,
                lm: '2021-04-19T10:51:04.027Z',
                fname: '5593165392832 - WhatsApp',
                t: 'l',
                ts: '2021-04-19T10:51:04.027Z',
                v: { _id: 'gwniTTrz84Lc9e7jH', username: 'guest-569', token: '5511942215083@c.us', status: 'online' },
                cl: false,
                open: true,
                waitingResponse: true,
                _updatedAt: '2021-04-19T10:51:04.027Z',
              },
              newRoom: true,
              success: true,
            },
          })

          const expectedBody = {
            token: '5593165392832@c.us',
            rid: 'HNpDrzmTdJB4Z3TR8',
            msg: 'https://file-url.com',
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return url === 'https://rocket.com.br/api/v1/livechat/message' && body === JSON.stringify(expectedBody)
            },
            {
              status: 200,
              body: {
                message: {
                  _id: 'ZNDvoAqpx6dKRTRHr',
                  rid: 'HNpDrzmTdJB4Z3TR8',
                  msg: 'message',
                  token: '5593165392832@c.us',
                  alias: 'John Doe - 5593165392832 - WhatsApp',
                  ts: '2021-04-19T10:52:59.817Z',
                  u: { _id: 'HNpDrzmTdJB4Z3TR8', username: 'guest-1208', name: 'John Doe - 5593165392832 - WhatsApp' },
                  _updatedAt: '2021-04-19T10:52:59.905Z',
                  mentions: [],
                  channels: [],
                },
                success: true,
              },
            }
          )

          expect(message.sended).toEqual(false)

          const rocketchat = new Rocketchat(licensee)
          await rocketchat.sendMessage(message._id, 'https://rocket.com.br')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
        })
      })

      describe('when does not create visitor', () => {
        it('logs the error and does not send message', async () => {
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

          const expectedBodyVisitor = {
            visitor: {
              name: 'John Doe - 5593165392832 - WhatsApp',
              email: 'john@doe.com',
              token: '5593165392832@c.us',
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url === 'https://rocket.com.br/api/v1/livechat/visitor' && body === JSON.stringify(expectedBodyVisitor)
              )
            },
            { status: 200, body: { success: false } }
          )

          expect(message.sended).toEqual(false)

          const rocketchat = new Rocketchat(licensee)
          await rocketchat.sendMessage(message._id, 'https://rocket.com.br')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(false)

          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Não foi possível criar o visitante na Rocketchat {"success":false}'
          )
        })
      })

      describe('when does not create room', () => {
        it('logs the error and does not send message', async () => {
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

          const expectedBodyVisitor = {
            visitor: {
              name: 'John Doe - 5593165392832 - WhatsApp',
              email: 'john@doe.com',
              token: '5593165392832@c.us',
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url === 'https://rocket.com.br/api/v1/livechat/visitor' && body === JSON.stringify(expectedBodyVisitor)
              )
            },
            {
              status: 200,
              body: {
                visitor: {
                  _id: 'Z4pqikNyvjvwksYfE',
                  username: 'guest-1208',
                  ts: '2021-04-19T10:52:59.481Z',
                  _updatedAt: '2021-04-19T10:52:59.483Z',
                  name: 'John Doe - 5593165392832 - WhatsApp',
                  token: '5593165392832@c.us',
                  visitorEmails: [{ address: 'john@doe.com' }],
                },
                success: true,
              },
            }
          )

          fetchMock.getOnce('https://rocket.com.br/api/v1/livechat/room?token=5593165392832@c.us', {
            status: 200,
            body: { success: false },
          })

          expect(message.sended).toEqual(false)

          const rocketchat = new Rocketchat(licensee)
          await rocketchat.sendMessage(message._id, 'https://rocket.com.br')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(false)

          expect(consoleErrorSpy).toHaveBeenCalledWith('Não foi possível criar a sala na Rocketchat {"success":false}')
        })
      })

      describe('when does not send message', () => {
        it('logs the error', async () => {
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

          const expectedBodyVisitor = {
            visitor: {
              name: 'John Doe - 5593165392832 - WhatsApp',
              email: 'john@doe.com',
              token: '5593165392832@c.us',
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url === 'https://rocket.com.br/api/v1/livechat/visitor' && body === JSON.stringify(expectedBodyVisitor)
              )
            },
            {
              status: 200,
              body: {
                visitor: {
                  _id: 'Z4pqikNyvjvwksYfE',
                  username: 'guest-1208',
                  ts: '2021-04-19T10:52:59.481Z',
                  _updatedAt: '2021-04-19T10:52:59.483Z',
                  name: 'John Doe - 5593165392832 - WhatsApp',
                  token: '5593165392832@c.us',
                  visitorEmails: [{ address: 'john@doe.com' }],
                },
                success: true,
              },
            }
          )

          fetchMock.getOnce('https://rocket.com.br/api/v1/livechat/room?token=5593165392832@c.us', {
            status: 200,
            body: {
              room: {
                _id: 'HNpDrzmTdJB4Z3TR8',
                msgs: 0,
                usersCount: 1,
                lm: '2021-04-19T10:51:04.027Z',
                fname: '5593165392832 - WhatsApp',
                t: 'l',
                ts: '2021-04-19T10:51:04.027Z',
                v: { _id: 'gwniTTrz84Lc9e7jH', username: 'guest-569', token: '5511942215083@c.us', status: 'online' },
                cl: false,
                open: true,
                waitingResponse: true,
                _updatedAt: '2021-04-19T10:51:04.027Z',
              },
              newRoom: true,
              success: true,
            },
          })

          const expectedBody = {
            token: '5593165392832@c.us',
            rid: 'HNpDrzmTdJB4Z3TR8',
            msg: 'Message to send',
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return url === 'https://rocket.com.br/api/v1/livechat/message' && body === JSON.stringify(expectedBody)
            },
            { status: 200, body: { success: false } }
          )

          expect(message.sended).toEqual(false)

          const rocketchat = new Rocketchat(licensee)
          await rocketchat.sendMessage(message._id, 'https://rocket.com.br')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(false)

          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 não enviada para a Rocketchat {"success":false}'
          )
        })
      })
    })
  })

  describe('#transfer', () => {
    it('changes the talking with chatbot in contact to false', async () => {
      jest.spyOn(Rocketchat.prototype, 'sendMessage').mockImplementation()
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
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

      expect(contact.talkingWithChatBot).toEqual(true)

      const rocketchat = new Rocketchat(licensee)
      await rocketchat.transfer(message._id, 'url')

      const modifiedContact = await Contact.findById(contact._id)
      expect(modifiedContact.talkingWithChatBot).toEqual(false)
    })

    it('sends message to chat', async () => {
      const sendMessageSpy = jest.spyOn(Rocketchat.prototype, 'sendMessage').mockImplementation()
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
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

      const rocketchat = new Rocketchat(licensee)
      await rocketchat.transfer(message._id.toString(), 'url')

      expect(sendMessageSpy).toHaveBeenCalledTimes(1)
      expect(sendMessageSpy).toHaveBeenCalledWith('60958703f415ed4008748637', 'url')
    })
  })

  describe('#closeChat', () => {
    it('resets the room id in contact', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const contact = await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: false,
        licensee: licensee,
        roomId: 'ka3DiV9CuHD765',
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

      expect(contact.talkingWithChatBot).toEqual(false)
      expect(contact.roomId).toEqual('ka3DiV9CuHD765')

      const rocketchat = new Rocketchat(licensee)
      await rocketchat.closeChat(message._id)

      const modifiedContact = await Contact.findById(contact._id)
      expect(modifiedContact.roomId).toEqual('')
    })

    describe('when the licensee use chatbot', () => {
      it('changes the talking with chatbot in contact to true', async () => {
        const licensee = await Licensee.create({
          name: 'Alcateia Ltds',
          active: true,
          licenseKind: 'demo',
          useChatbot: true,
          chatbotDefault: 'landbot',
          chatbotUrl: 'https://url.com',
          chatbotAuthorizationToken: 'token',
        })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
          roomId: 'ka3DiV9CuHD765',
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

        expect(contact.talkingWithChatBot).toEqual(false)
        expect(contact.roomId).toEqual('ka3DiV9CuHD765')

        const rocketchat = new Rocketchat(licensee)
        await rocketchat.closeChat(message._id)

        const modifiedContact = await Contact.findById(contact._id)
        expect(modifiedContact.talkingWithChatBot).toEqual(true)
        expect(modifiedContact.roomId).toEqual('')
      })
    })
  })

  describe('#action', () => {
    it('returns "close-chat" if message type is "LivechatSession"', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        type: 'LivechatSession',
      }

      const rocketchat = new Rocketchat(licensee)
      expect(rocketchat.action(responseBody)).toEqual('close-chat')
    })

    it('returns "close-chat" if message have a message with closingMessage attribute', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        type: 'Message',
        messages: [
          {
            msg: 'Hello message',
          },
          {
            closingMessage: true
          },
        ],
      }

      const rocketchat = new Rocketchat(licensee)
      expect(rocketchat.action(responseBody)).toEqual('close-chat')
    })

    it('returns "send-message-to-messenger" if message type is not "LivechatSession"', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        type: 'Message',
      }

      const rocketchat = new Rocketchat(licensee)
      expect(rocketchat.action(responseBody)).toEqual('send-message-to-messenger')
    })
  })
})
