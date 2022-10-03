const Crisp = require('./Crisp')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const Room = require('@models/Room')
const Trigger = require('@models/Trigger')
const fetchMock = require('fetch-mock')
const mongoServer = require('../../../../.jest/utils')
const emoji = require('../../helpers/Emoji')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { room: roomFactory } = require('@factories/room')
const { message: messageFactory } = require('@factories/message')
const { triggerReplyButton: triggerReplyButtonFactory } = require('@factories/trigger')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Crisp plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()
  const emojiReplaceSpy = jest.spyOn(emoji, 'replace')

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    fetchMock.reset()

    licensee = await Licensee.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#responseToMessages', () => {
    it('returns the response body transformed in messages', async () => {
      const contact = await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: true,
          licensee,
        })
      )

      const room = await Room.create(
        roomFactory.build({
          roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          contact,
        })
      )

      const responseBody = {
        website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
        event: 'message:received',
        data: {
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
          type: 'text',
          from: 'operator',
          origin: 'chat',
          content: 'Hello world',
          fingerprint: 163239623329114,
          user: {
            nickname: 'John Doe',
            user_id: '440ac64d-fee9-4935-b7a8-4c8cb44bb13c',
          },
          mentions: [],
          timestamp: 1632396233539,
          stamped: true,
          session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
        },
        timestamp: 1632396233588,
      }

      const crisp = new Crisp(licensee)
      const messages = await crisp.responseToMessages(responseBody)

      expect(messages[0]).toBeInstanceOf(Message)
      expect(messages[0].licensee).toEqual(licensee._id)
      expect(messages[0].contact).toEqual(contact._id)
      expect(messages[0].room._id).toEqual(room._id)
      expect(messages[0].kind).toEqual('text')
      expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
      expect(messages[0].destination).toEqual('to-messenger')
      expect(messages[0].text).toEqual('Hello world')
      expect(messages[0].url).toEqual(undefined)
      expect(messages[0].fileName).toEqual(undefined)
      expect(messages[0].latitude).toEqual(undefined)
      expect(messages[0].longitude).toEqual(undefined)
      expect(messages[0].departament).toEqual(undefined)

      expect(emojiReplaceSpy).toHaveBeenCalled()
      expect(emojiReplaceSpy).toHaveBeenCalledWith('Hello world')

      expect(messages.length).toEqual(1)
    })

    it('return the empty data if body is blank', async () => {
      const responseBody = {}

      const crisp = new Crisp(licensee)
      const message = await crisp.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if body event is no "message:send" or "message:received" or "session:removed"', async () => {
      const responseBody = {
        event: 'message:another',
      }

      const crisp = new Crisp(licensee)
      const message = await crisp.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if room is not exists', async () => {
      const responseBody = {
        website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
        event: 'message:received',
        data: {
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
          type: 'text',
          from: 'operator',
          origin: 'chat',
          content: 'Hello world',
          fingerprint: 163239623329114,
          user: {
            nickname: 'John Doe',
            user_id: '440ac64d-fee9-4935-b7a8-4c8cb44bb13c',
          },
          mentions: [],
          timestamp: 1632396233539,
          stamped: true,
          session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
        },
        timestamp: 1632396233588,
      }

      const crisp = new Crisp(licensee)
      const messages = await crisp.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('returns the response body transformed in message to close-chat if event is "session:removed"', async () => {
      const contact = await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: true,
          licensee,
        })
      )

      const room = await Room.create(
        roomFactory.build({
          roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          contact,
        })
      )

      const responseBody = {
        website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
        event: 'session:removed',
        data: {
          session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
        },
      }

      const crisp = new Crisp(licensee)
      const messages = await crisp.responseToMessages(responseBody)

      expect(messages[0]).toBeInstanceOf(Message)
      expect(messages[0].licensee).toEqual(licensee._id)
      expect(messages[0].contact).toEqual(contact._id)
      expect(messages[0].room._id).toEqual(room._id)
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

    it('returns the response body transformed in message to close-chat if event is "message:received" and namespace is "state:resolved"', async () => {
      const contact = await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: true,
          licensee,
        })
      )

      const room = await Room.create(
        roomFactory.build({
          roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          contact,
        })
      )

      const responseBody = {
        website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
        event: 'message:received',
        data: {
          session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          content: {
            namespace: 'state:resolved',
          },
        },
      }

      const crisp = new Crisp(licensee)
      const messages = await crisp.responseToMessages(responseBody)

      expect(messages[0]).toBeInstanceOf(Message)
      expect(messages[0].licensee).toEqual(licensee._id)
      expect(messages[0].contact).toEqual(contact._id)
      expect(messages[0].room._id).toEqual(room._id)
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

    describe('message types', () => {
      it('returns messages with file data if it is file', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          })
        )

        await Room.create(
          roomFactory.build({
            roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
            contact,
          })
        )

        const responseBody = {
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
          event: 'message:received',
          data: {
            website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
            type: 'file',
            from: 'operator',
            origin: 'chat',
            content: {
              name: 'dojocat.jpg',
              url: 'https://octodex.github.com/images/dojocat.jpg',
            },
            fingerprint: 163239623329114,
            user: {
              nickname: 'John Doe',
              user_id: '440ac64d-fee9-4935-b7a8-4c8cb44bb13c',
            },
            mentions: [],
            timestamp: 1632396233539,
            stamped: true,
            session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          },
          timestamp: 1632396233588,
        }

        const crisp = new Crisp(licensee)
        const messages = await crisp.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual('https://octodex.github.com/images/dojocat.jpg')
        expect(messages[0].fileName).toEqual('dojocat.jpg')
      })

      it('returns messages with file data if it is audio', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          })
        )

        await Room.create(
          roomFactory.build({
            roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
            contact,
          })
        )

        const responseBody = {
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
          event: 'message:received',
          data: {
            website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
            type: 'audio',
            from: 'operator',
            origin: 'chat',
            content: {
              name: 'dojocat.ogg',
              url: 'https://octodex.github.com/images/dojocat.ogg',
            },
            fingerprint: 163239623329114,
            user: {
              nickname: 'John Doe',
              user_id: '440ac64d-fee9-4935-b7a8-4c8cb44bb13c',
            },
            mentions: [],
            timestamp: 1632396233539,
            stamped: true,
            session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          },
          timestamp: 1632396233588,
        }

        const crisp = new Crisp(licensee)
        const messages = await crisp.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual('https://octodex.github.com/images/dojocat.ogg')
        expect(messages[0].fileName).toEqual('dojocat.ogg')
      })

      it('returns messages with file data if it is audio [filename = url]', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          })
        )

        await Room.create(
          roomFactory.build({
            roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
            contact,
          })
        )

        const responseBody = {
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
          event: 'message:received',
          data: {
            website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
            type: 'audio',
            from: 'operator',
            origin: 'chat',
            content: {
              url: 'https://octodex.github.com/images/dojocat.ogg',
            },
            fingerprint: 163239623329114,
            user: {
              nickname: 'John Doe',
              user_id: '440ac64d-fee9-4935-b7a8-4c8cb44bb13c',
            },
            mentions: [],
            timestamp: 1632396233539,
            stamped: true,
            session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          },
          timestamp: 1632396233588,
        }

        const crisp = new Crisp(licensee)
        const messages = await crisp.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual('https://octodex.github.com/images/dojocat.ogg')
        expect(messages[0].fileName).toEqual('https://octodex.github.com/images/dojocat.ogg')
      })

      it('returns empty data if kind is unknown', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          })
        )

        await Room.create(
          roomFactory.build({
            roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
            contact,
          })
        )

        const responseBody = {
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
          event: 'message:send',
          data: {
            website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
            type: 'voice',
            from: 'operator',
            origin: 'chat',
            content: {
              name: 'dojocat.ogg',
              url: 'https://octodex.github.com/images/dojocat.ogg',
            },
            fingerprint: 163239623329114,
            user: {
              nickname: 'John Doe',
              user_id: '440ac64d-fee9-4935-b7a8-4c8cb44bb13c',
            },
            mentions: [],
            timestamp: 1632396233539,
            stamped: true,
            session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          },
          timestamp: 1632396233588,
        }

        const crisp = new Crisp(licensee)
        const message = await crisp.responseToMessages(responseBody)

        expect(message).toEqual([])
      })

      it('returns messages with interactive data if it is text with trigger expression', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          })
        )

        await Room.create(
          roomFactory.build({
            roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
            contact,
          })
        )

        const triggerOrder2 = await Trigger.create(triggerReplyButtonFactory.build({ licensee, order: 2 }))
        const trigger = await Trigger.create(triggerReplyButtonFactory.build({ licensee }))

        const responseBody = {
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
          event: 'message:received',
          data: {
            website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
            type: 'text',
            from: 'operator',
            origin: 'chat',
            content: 'send_reply_buttons',
            fingerprint: 163239623329114,
            user: {
              nickname: 'John Doe',
              user_id: '440ac64d-fee9-4935-b7a8-4c8cb44bb13c',
            },
            mentions: [],
            timestamp: 1632396233539,
            stamped: true,
            session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          },
          timestamp: 1632396233588,
        }

        const crisp = new Crisp(licensee)
        const messages = await crisp.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('interactive')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-messenger')
        expect(messages[0].text).toEqual('send_reply_buttons')
        expect(messages[0].trigger).toEqual(trigger._id)
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages[1]).toBeInstanceOf(Message)
        expect(messages[1].licensee).toEqual(licensee._id)
        expect(messages[1].contact).toEqual(contact._id)
        expect(messages[1].kind).toEqual('interactive')
        expect(messages[1].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[1].destination).toEqual('to-messenger')
        expect(messages[1].text).toEqual('send_reply_buttons')
        expect(messages[1].trigger).toEqual(triggerOrder2._id)
        expect(messages[1].url).toEqual(undefined)
        expect(messages[1].fileName).toEqual(undefined)
        expect(messages[1].latitude).toEqual(undefined)
        expect(messages[1].longitude).toEqual(undefined)
        expect(messages[1].departament).toEqual(undefined)

        expect(messages.length).toEqual(2)
      })

      it('returns message of kind template if type is text and has {{ and }}', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          })
        )

        await Room.create(
          roomFactory.build({
            roomId: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
            contact,
          })
        )

        const responseBody = {
          website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
          event: 'message:received',
          data: {
            website_id: 'e93e073a-1f69-4cbc-8934-f9e1611e65bb',
            type: 'text',
            from: 'operator',
            origin: 'chat',
            content: '{{name}}',
            fingerprint: 163239623329114,
            user: {
              nickname: 'John Doe',
              user_id: '440ac64d-fee9-4935-b7a8-4c8cb44bb13c',
            },
            mentions: [],
            timestamp: 1632396233539,
            stamped: true,
            session_id: 'session_94e30081-c1ff-4656-b612-9c6e18d70ffb',
          },
          timestamp: 1632396233588,
        }

        const crisp = new Crisp(licensee)
        const messages = await crisp.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].kind).toEqual('template')
        expect(messages[0].text).toEqual('{{name}}')
      })
    })
  })

  describe('#sendMessage', () => {
    describe('when response data does not contains error', () => {
      it('marks the message with sended', async () => {
        const licensee = await Licensee.create(
          licenseeFactory.build({
            chatIdentifier: 'identifier',
            chatKey: 'key',
          })
        )

        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            email: 'john@doe.com',
            licensee,
          })
        )

        const message = await Message.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          })
        )

        fetchMock.postOnce(
          (url, { headers }) => {
            return (
              url === 'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation' &&
              JSON.stringify(headers).includes('Authorization') &&
              JSON.stringify(headers).includes('X-Crisp-Tier')
            )
          },
          {
            status: 201,
            body: {
              error: false,
              reason: 'added',
              data: {
                session_id: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
              },
            },
          }
        )

        const expectedBodyPatch = {
          nickname: 'John Doe - 5511990283745 - WhatsApp',
          email: 'john@doe.com',
          phone: '5511990283745',
        }

        fetchMock.patchOnce(
          (url, { headers, body }) => {
            return (
              url ===
                'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta' &&
              body === JSON.stringify(expectedBodyPatch) &&
              JSON.stringify(headers).includes('Authorization') &&
              JSON.stringify(headers).includes('X-Crisp-Tier')
            )
          },
          {
            status: 200,
            body: {
              error: false,
              reason: 'updated',
              data: {},
            },
          }
        )

        const expectedBody = {
          from: 'user',
          origin: 'chat',
          type: 'text',
          content: 'Message to send',
        }

        fetchMock.postOnce(
          (url, { headers, body }) => {
            return (
              url ===
                'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message' &&
              body === JSON.stringify(expectedBody) &&
              JSON.stringify(headers).includes('Authorization') &&
              JSON.stringify(headers).includes('X-Crisp-Tier')
            )
          },
          {
            status: 202,
            body: {
              error: false,
              reason: 'dispatched',
              data: {
                fingerprint: 163408807364277,
              },
            },
          }
        )

        expect(message.sended).toEqual(false)

        const crisp = new Crisp(licensee)
        await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(3)

        const messageUpdated = await Message.findById(message._id)
        expect(messageUpdated.sended).toEqual(true)
      })

      it('logs the success message', async () => {
        const licensee = await Licensee.create(
          licenseeFactory.build({
            chatIdentifier: 'identifier',
            chatKey: 'key',
          })
        )

        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            email: 'john@doe.com',
            licensee,
          })
        )

        const message = await Message.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          })
        )

        fetchMock.postOnce('https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation', {
          status: 201,
          body: {
            error: false,
            reason: 'added',
            data: {
              session_id: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
            },
          },
        })

        fetchMock.patchOnce(
          'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta',
          {
            status: 200,
            body: {
              error: false,
              reason: 'updated',
              data: {},
            },
          }
        )

        fetchMock.postOnce(
          'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message',
          {
            status: 202,
            body: {
              error: false,
              reason: 'dispatched',
              data: {
                fingerprint: 163408807364277,
              },
            },
          }
        )

        expect(message.sended).toEqual(false)

        const crisp = new Crisp(licensee)
        await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(3)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Mensagem 60958703f415ed4008748637 enviada para Crisp com sucesso!')
      })

      describe('when message has a departament', () => {
        it('sends the departament when updates the conversation', async () => {
          const licensee = await Licensee.create(
            licenseeFactory.build({
              chatIdentifier: 'identifier',
              chatKey: 'key',
            })
          )

          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              email: 'john@doe.com',
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
              departament: 'segment1,segment 2',
            })
          )

          fetchMock.postOnce('https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation', {
            status: 201,
            body: {
              error: false,
              reason: 'added',
              data: {
                session_id: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
              },
            },
          })

          fetchMock.patchOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta',
            {
              status: 200,
              body: {
                error: false,
                reason: 'updated',
                data: {},
              },
            }
          )

          fetchMock.postOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message',
            {
              status: 202,
              body: {
                error: false,
                reason: 'dispatched',
                data: {
                  fingerprint: 163408807364277,
                },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const crisp = new Crisp(licensee)
          await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
        })
      })

      describe('when message is for group', () => {
        it('send message formatted to group', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'Grupo Teste',
              number: '5511989187726-1622497000@g.us',
              type: '@g.us',
              email: 'john@doe.com',
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
              senderName: 'John Doe',
            })
          )

          fetchMock.postOnce('https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation', {
            status: 201,
            body: {
              error: false,
              reason: 'added',
              data: {
                session_id: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
              },
            },
          })

          const expectedBodyPatch = {
            nickname: 'Grupo Teste - 5511989187726-1622497000 - WhatsApp',
            email: 'john@doe.com',
            phone: '5511989187726-1622497000',
          }

          fetchMock.patchOnce(
            (url, { body }) => {
              return (
                url ===
                  'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta' &&
                body === JSON.stringify(expectedBodyPatch)
              )
            },
            {
              status: 200,
              body: {
                error: false,
                reason: 'updated',
                data: {},
              },
            }
          )

          const expectedBody = {
            from: 'user',
            origin: 'chat',
            type: 'text',
            content: '*John Doe:*\nMessage to send',
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url ===
                  'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message' &&
                body === JSON.stringify(expectedBody)
              )
            },
            {
              status: 202,
              body: {
                error: false,
                reason: 'dispatched',
                data: {
                  fingerprint: 163408807364277,
                },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const crisp = new Crisp(licensee)
          await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
        })
      })

      describe('when message has a session and departament', () => {
        it('updates conversation to sets the segments', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              email: 'john@doe.com',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
              departament: 'segment1,segment 2',
            })
          )

          await Room.create(
            roomFactory.build({
              roomId: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
              contact,
            })
          )

          const expectedBodyPatch = {
            segments: ['segment1', 'segment 2'],
          }

          fetchMock.patchOnce(
            (url, { body }) => {
              return (
                url ===
                  'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta' &&
                body === JSON.stringify(expectedBodyPatch)
              )
            },
            {
              status: 200,
              body: {
                error: false,
                reason: 'updated',
                data: {},
              },
            }
          )

          fetchMock.postOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message',
            {
              status: 202,
              body: {
                error: false,
                reason: 'dispatched',
                data: {
                  fingerprint: 163408807364277,
                },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const crisp = new Crisp(licensee)
          await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
        })
      })

      describe('when does not create session', () => {
        it('logs the error and does not send message', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              email: 'john@doe.com',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              _id: '60958703f415ed4008748637',
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
            })
          )

          fetchMock.postOnce('https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation', {
            status: 402,
            body: {
              error: true,
              reason: 'invalid_session',
              data: {},
            },
          })

          expect(message.sended).toEqual(false)

          const crisp = new Crisp(licensee)
          await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(false)

          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Não foi possível criar a sessão na Crisp {"error":true,"reason":"invalid_session","data":{}}'
          )
        })
      })

      describe('when does not send message', () => {
        it('logs the error', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              email: 'john@doe.com',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              _id: '60958703f415ed4008748637',
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
            })
          )

          fetchMock.postOnce('https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation', {
            status: 201,
            body: {
              error: false,
              reason: 'added',
              data: {
                session_id: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
              },
            },
          })

          fetchMock.patchOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta',
            {
              status: 200,
              body: {
                error: false,
                reason: 'updated',
                data: {},
              },
            }
          )

          fetchMock.postOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message',
            {
              status: 404,
              body: {
                error: true,
                reason: 'invalid_data',
                data: {
                  namespace: 'data',
                  message: 'data.user.type should be equal to one of the allowed values',
                },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const crisp = new Crisp(licensee)
          await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(false)
          expect(messageUpdated.error).toEqual(
            'mensagem: {"error":true,"reason":"invalid_data","data":{"namespace":"data","message":"data.user.type should be equal to one of the allowed values"}}'
          )

          expect(consoleErrorSpy).toHaveBeenCalledWith(
            `Mensagem 60958703f415ed4008748637 não enviada para Crisp.
           status: 404
           mensagem: {"error":true,"reason":"invalid_data","data":{"namespace":"data","message":"data.user.type should be equal to one of the allowed values"}}`
          )
        })
      })
    })

    describe('message types', () => {
      describe('when message is text', () => {
        it('sends the message with text', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              email: 'john@doe.com',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
            })
          )

          fetchMock.postOnce('https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation', {
            status: 201,
            body: {
              error: false,
              reason: 'added',
              data: {
                session_id: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
              },
            },
          })

          fetchMock.patchOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta',
            {
              status: 200,
              body: {
                error: false,
                reason: 'updated',
                data: {},
              },
            }
          )

          fetchMock.postOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message',
            {
              status: 202,
              body: {
                error: false,
                reason: 'dispatched',
                data: {
                  fingerprint: 163408807364277,
                },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const crisp = new Crisp(licensee)
          await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)
        })
      })

      describe('when message is file', () => {
        it('sends the message with file', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              email: 'john@doe.com',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
              kind: 'file',
              url: 'https://message.with.file.com/file.txt',
              fileName: 'file.txt',
            })
          )

          fetchMock.postOnce('https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation', {
            status: 201,
            body: {
              error: false,
              reason: 'added',
              data: {
                session_id: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
              },
            },
          })

          fetchMock.patchOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta',
            {
              status: 200,
              body: {
                error: false,
                reason: 'updated',
                data: {},
              },
            }
          )

          const expectedBody = {
            from: 'user',
            origin: 'chat',
            type: 'file',
            content: {
              name: 'file.txt',
              url: 'https://message.with.file.com/file.txt',
              type: 'text/plain',
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url ===
                  'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message' &&
                body === JSON.stringify(expectedBody)
              )
            },
            {
              status: 202,
              body: {
                error: false,
                reason: 'dispatched',
                data: {
                  fingerprint: 163408807364277,
                },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const crisp = new Crisp(licensee)
          await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)
        })
      })

      describe('when message is audio', () => {
        it('sends the message with audio', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              email: 'john@doe.com',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
              kind: 'file',
              url: 'https://message.with.file.com/file.ogg',
              fileName: 'file.ogg',
            })
          )

          fetchMock.postOnce('https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation', {
            status: 201,
            body: {
              error: false,
              reason: 'added',
              data: {
                session_id: 'session_a06054de-d9dc-407a-98ea-72c7fb460472',
              },
            },
          })

          fetchMock.patchOnce(
            'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta',
            {
              status: 200,
              body: {
                error: false,
                reason: 'updated',
                data: {},
              },
            }
          )

          const expectedBody = {
            from: 'user',
            origin: 'chat',
            type: 'audio',
            content: {
              name: 'file.ogg',
              url: 'https://message.with.file.com/file.ogg',
              type: 'audio/ogg',
              duration: 60,
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url ===
                  'https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message' &&
                body === JSON.stringify(expectedBody)
              )
            },
            {
              status: 202,
              body: {
                error: false,
                reason: 'dispatched',
                data: {
                  fingerprint: 163408807364277,
                },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const crisp = new Crisp(licensee)
          await crisp.sendMessage(message._id, '631d631e-2047-453e-9989-93edda91b945')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(3)
        })
      })
    })
  })

  describe('#transfer', () => {
    it('changes the talking with chatbot in contact to false', async () => {
      jest.spyOn(Crisp.prototype, 'sendMessage').mockImplementation()
      const contact = await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          email: 'john@doe.com',
          talkingWithChatBot: true,
          licensee,
        })
      )

      const message = await Message.create(
        messageFactory.build({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          contact,
          licensee,
          sended: false,
        })
      )

      expect(contact.talkingWithChatBot).toEqual(true)

      const crisp = new Crisp(licensee)
      await crisp.transfer(message._id, 'url')

      const modifiedContact = await Contact.findById(contact._id)
      expect(modifiedContact.talkingWithChatBot).toEqual(false)
    })

    it('sends message to chat', async () => {
      const sendMessageSpy = jest.spyOn(Crisp.prototype, 'sendMessage').mockImplementation()
      const contact = await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          email: 'john@doe.com',
          talkingWithChatBot: true,
          licensee,
        })
      )

      const message = await Message.create(
        messageFactory.build({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          contact,
          licensee,
          sended: false,
        })
      )

      const crisp = new Crisp(licensee)
      await crisp.transfer(message._id.toString(), 'url')

      expect(sendMessageSpy).toHaveBeenCalledTimes(1)
      expect(sendMessageSpy).toHaveBeenCalledWith('60958703f415ed4008748637', 'url')
    })
  })

  describe('#closeChat', () => {
    describe('when the licensee use chatbot', () => {
      it('changes the talking with chatbot in contact to true', async () => {
        const licensee = await Licensee.create(
          licenseeFactory.build({
            useChatbot: true,
            chatbotDefault: 'landbot',
            chatbotUrl: 'https://url.com',
            chatbotAuthorizationToken: 'token',
          })
        )

        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const room = await Room.create(
          roomFactory.build({
            roomId: 'ka3DiV9CuHD765',
            contact,
          })
        )

        const message = await Message.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            room,
            sended: false,
          })
        )

        expect(contact.talkingWithChatBot).toEqual(false)

        const crisp = new Crisp(licensee)
        const messages = await crisp.closeChat(message._id)

        const modifiedContact = await Contact.findById(contact._id)
        expect(modifiedContact.talkingWithChatBot).toEqual(true)

        expect(messages.length).toEqual(0)
      })
    })

    describe('when the licensee has a message on close chat', () => {
      it('creates the messages to send to messenger before close chat', async () => {
        const licensee = await Licensee.create(
          licenseeFactory.build({
            useChatbot: true,
            chatbotDefault: 'landbot',
            chatbotUrl: 'https://url.com',
            chatbotAuthorizationToken: 'token',
            messageOnCloseChat: 'Send on close chat',
          })
        )

        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            email: 'john@doe.com',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const room = await Room.create(
          roomFactory.build({
            roomId: 'ka3DiV9CuHD765',
            contact,
          })
        )

        const message = await Message.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            room,
            sended: false,
          })
        )

        expect(contact.talkingWithChatBot).toEqual(false)

        const crisp = new Crisp(licensee)
        const messages = await crisp.closeChat(message._id)

        const modifiedContact = await Contact.findById(contact._id)
        expect(modifiedContact.talkingWithChatBot).toEqual(true)

        expect(messages.length).toEqual(1)
        expect(messages[0].text).toEqual('Send on close chat')
      })
    })
  })

  describe('#action', () => {
    it('returns "send-message-to-messenger"', () => {
      const responseBody = {
        event: 'message:received',
        data: {
          content: 'Message received',
        },
      }

      const crisp = new Crisp(licensee)
      expect(crisp.action(responseBody)).toEqual('send-message-to-messenger')
    })
    it('returns "close-chat" if event is "session:removed"', () => {
      const responseBody = {
        event: 'session:removed',
      }

      const crisp = new Crisp(licensee)
      expect(crisp.action(responseBody)).toEqual('close-chat')
    })

    it('returns "close-chat" if event is "message:received" and namespace is "state:resolved"', () => {
      const responseBody = {
        event: 'message:received',
        data: {
          content: {
            namespace: 'state:resolved',
          },
        },
      }

      const crisp = new Crisp(licensee)
      expect(crisp.action(responseBody)).toEqual('close-chat')
    })
  })

  describe('.messageType', () => {
    it('returns "file" if fileUrl is photo', () => {
      expect(Crisp.messageType('file.jpg')).toEqual('file')
    })

    it('returns "file" if fileUrl is video', () => {
      expect(Crisp.messageType('file.mpg')).toEqual('file')
    })

    it('returns "audio" if fileUrl is audio', () => {
      expect(Crisp.messageType('file.ogg')).toEqual('audio')
    })

    it('returns "file" if fileUrl is voice', () => {
      expect(Crisp.messageType('file.opus')).toEqual('file')
    })

    it('returns "file" if fileUrl is another extension', () => {
      expect(Crisp.messageType('file.txt')).toEqual('file')
    })
  })
})
