const Jivochat = require('./Jivochat')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const fetchMock = require('fetch-mock')
const mongoServer = require('.jest/utils')
const emoji = require('../../helpers/Emoji')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Jivochat plugin', () => {
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
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5593165392832@c.us',
        },
        message: {
          type: 'text',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const jivochat = new Jivochat(licensee)
      const messages = await jivochat.responseToMessages(responseBody)

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

      expect(emojiReplaceSpy).toHaveBeenCalled()
      expect(emojiReplaceSpy).toHaveBeenCalledWith('Hello world')

      expect(messages.length).toEqual(1)
    })

    it('return the empty data if body is blank', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {}

      const jivochat = new Jivochat(licensee)
      const message = await jivochat.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if body does not have a message', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5593165392832@c.us',
        },
      }

      const jivochat = new Jivochat(licensee)
      const message = await jivochat.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if body does not have a recipient', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        message: {
          type: 'text',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const jivochat = new Jivochat(licensee)
      const message = await jivochat.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if type is typein', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5593165392832@c.us',
        },
        message: {
          type: 'typein',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const jivochat = new Jivochat(licensee)
      const message = await jivochat.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if type is typeout', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5593165392832@c.us',
        },
        message: {
          type: 'typeout',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const jivochat = new Jivochat(licensee)
      const message = await jivochat.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if type is stop', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5593165392832@c.us',
        },
        message: {
          type: 'stop',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const jivochat = new Jivochat(licensee)
      const message = await jivochat.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    describe('message types', () => {
      it('returns messages with file data if it is file', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: true,
          licensee: licensee,
        })

        const responseBody = {
          sender: {
            name: 'Mary Jane',
          },
          recipient: {
            id: '5593165392832@c.us',
          },
          message: {
            type: 'video',
            id: 'jivo_message_id',
            file: 'https://octodex.github.com/images/dojocat.jpg',
            file_name: 'dojocat.jpg',
          },
        }

        const jivochat = new Jivochat(licensee)
        const messages = await jivochat.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].text).toEqual('')
        expect(messages[0].url).toEqual('https://octodex.github.com/images/dojocat.jpg')
        expect(messages[0].fileName).toEqual('dojocat.jpg')
      })

      it('returns messages with coordinates data if it is location', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: true,
          licensee: licensee,
        })

        const responseBody = {
          sender: {
            name: 'Mary Jane',
          },
          recipient: {
            id: '5593165392832@c.us',
          },
          message: {
            type: 'location',
            id: 'jivo_message_id',
            latitude: 123.93,
            longitude: 12.0,
          },
        }

        const jivochat = new Jivochat(licensee)
        const messages = await jivochat.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].kind).toEqual('location')
        expect(messages[0].text).toEqual('')
        expect(messages[0].latitude).toEqual(123.93)
        expect(messages[0].longitude).toEqual(12.0)
      })

      it('logs the info and return empty data if kind is unknown', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const responseBody = {
          sender: {
            name: 'Mary Jane',
          },
          recipient: {
            id: '5593165392832@c.us',
          },
          message: {
            type: 'any',
            id: 'jivo_message_id',
            text: 'Hello world',
          },
        }

        const jivochat = new Jivochat(licensee)
        const message = await jivochat.responseToMessages(responseBody)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Tipo de mensagem retornado pela Jivochat não reconhecido: any')

        expect(message).toEqual([])
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

        const expectedBody = {
          sender: {
            id: '5593165392832@c.us',
            name: 'John Doe',
            email: 'john@doe.com',
            phone: '5593165392832',
          },
          message: {
            id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            type: 'text',
            text: 'Message to send',
          },
        }

        fetchMock.postOnce((url, { body }) => {
          return url === 'https://url.com.br/jkJGs5a4ea/pAOqw2340' && body === JSON.stringify(expectedBody)
        }, 200)

        expect(message.sended).toEqual(false)

        const jivochat = new Jivochat(licensee)
        await jivochat.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
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
          sender: {
            id: '5593165392832@c.us',
            name: 'John Doe',
            email: 'john@doe.com',
            phone: '5593165392832',
          },
          message: {
            id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            type: 'text',
            text: 'Message to send',
          },
        }

        fetchMock.postOnce((url, { body }) => {
          return url === 'https://url.com.br/jkJGs5a4ea/pAOqw2340' && body === JSON.stringify(expectedBody)
        }, 200)

        expect(message.sended).toEqual(false)

        const jivochat = new Jivochat(licensee)
        await jivochat.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 enviada para Jivochat com sucesso!'
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

          const expectedBody = {
            sender: {
              id: '5511989187726-1622497000@g.us',
              name: 'Grupo Teste',
              email: 'john@doe.com',
            },
            message: {
              id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
              type: 'text',
              text: 'John Doe:\\nMessage to send\\n',
            },
          }

          fetchMock.postOnce((url, { body }) => {
            return url === 'https://url.com.br/jkJGs5a4ea/pAOqw2340' && body === JSON.stringify(expectedBody)
          }, 200)

          expect(message.sended).toEqual(false)

          const jivochat = new Jivochat(licensee)
          await jivochat.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
        })
      })
    })

    describe('when response is not 200', () => {
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
          sender: {
            id: '5593165392832@c.us',
            name: 'John Doe',
            email: 'john@doe.com',
            phone: '5593165392832',
          },
          message: {
            id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            type: 'text',
            text: 'Message to send',
          },
        }

        fetchMock.postOnce((url, { body }) => {
          return url === 'https://url.com.br/jkJGs5a4ea/pAOqw2340' && body === JSON.stringify(expectedBody)
        }, 404)

        expect(message.sended).toEqual(false)

        const jivochat = new Jivochat(licensee)
        await jivochat.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Mensagem 60958703f415ed4008748637 não enviada para Jivochat.
           status: 404
           mensagem: ${JSON.stringify('')}`
        )
      })
    })

    describe('message types', () => {
      describe('when message is location', () => {
        it('sends the message with location', async () => {
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
            kind: 'location',
            latitude: 10.2,
            longitude: 123.45,
            sended: false,
          })

          const expectedBody = {
            sender: {
              id: '5593165392832@c.us',
              name: 'John Doe',
              email: 'john@doe.com',
              phone: '5593165392832',
            },
            message: {
              id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
              type: 'location',
              latitude: 10.2,
              longitude: 123.45,
            },
          }

          fetchMock.postOnce((url, { body }) => {
            return url === 'https://url.com.br/jkJGs5a4ea/pAOqw2340' && body === JSON.stringify(expectedBody)
          }, 200)

          const jivochat = new Jivochat(licensee)
          await jivochat.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)
        })
      })

      describe('when message is text', () => {
        it('sends the message with text', async () => {
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

          const expectedBody = {
            sender: {
              id: '5593165392832@c.us',
              name: 'John Doe',
              email: 'john@doe.com',
              phone: '5593165392832',
            },
            message: {
              id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
              type: 'text',
              text: 'Message to send',
            },
          }

          fetchMock.postOnce((url, { body }) => {
            return url === 'https://url.com.br/jkJGs5a4ea/pAOqw2340' && body === JSON.stringify(expectedBody)
          }, 200)

          expect(message.sended).toEqual(false)

          const jivochat = new Jivochat(licensee)
          await jivochat.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)
        })
      })

      describe('when message is file', () => {
        it('sends the message with file', async () => {
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
            kind: 'file',
            url: 'https://message.with.file.com/file.txt',
            fileName: 'file.txt',
            sended: false,
          })

          const expectedBody = {
            sender: {
              id: '5593165392832@c.us',
              name: 'John Doe',
              email: 'john@doe.com',
              phone: '5593165392832',
            },
            message: {
              id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
              type: 'document',
              file: 'https://message.with.file.com/file.txt',
              file_name: 'file.txt',
            },
          }

          fetchMock.postOnce((url, { body }) => {
            return url === 'https://url.com.br/jkJGs5a4ea/pAOqw2340' && body === JSON.stringify(expectedBody)
          }, 200)

          expect(message.sended).toEqual(false)

          const jivochat = new Jivochat(licensee)
          await jivochat.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(1)
        })
      })
    })
  })

  describe('#transfer', () => {
    it('changes the talking with chatbot in contact to false', async () => {
      jest.spyOn(Jivochat.prototype, 'sendMessage').mockImplementation()
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

      const jivochat = new Jivochat(licensee)
      await jivochat.transfer(message._id, 'url')

      const modifiedContact = await Contact.findOne(contact._id)
      expect(modifiedContact.talkingWithChatBot).toEqual(false)
    })

    it('sends message to chat', async () => {
      const sendMessageSpy = jest.spyOn(Jivochat.prototype, 'sendMessage').mockImplementation()
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

      const jivochat = new Jivochat(licensee)
      await jivochat.transfer(message._id.toString(), 'url')

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

      const jivochat = new Jivochat(licensee)
      await jivochat.closeChat(message._id)

      const modifiedContact = await Contact.findOne(contact._id)
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

        const jivochat = new Jivochat(licensee)
        await jivochat.closeChat(message._id)

        const modifiedContact = await Contact.findOne(contact._id)
        expect(modifiedContact.talkingWithChatBot).toEqual(true)
        expect(modifiedContact.roomId).toEqual('')
      })
    })
  })

  describe('#action', () => {
    it('returns "close-chat" if message is "Chat encerrado pelo agente"', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        message: {
          text: 'Chat encerrado pelo agente',
        },
      }

      const jivochat = new Jivochat(licensee)
      expect(jivochat.action(responseBody)).toEqual('close-chat')
    })

    it('returns "close-chat" if message is "Chat closed by agent"', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        message: {
          text: 'Chat closed by agent',
        },
      }

      const jivochat = new Jivochat(licensee)
      expect(jivochat.action(responseBody)).toEqual('close-chat')
    })

    it('returns "send-message-to-messenger" if message is not "Chat closed by agent" and "Chat closed by agent"', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        message: {
          text: 'Message',
        },
      }

      const jivochat = new Jivochat(licensee)
      expect(jivochat.action(responseBody)).toEqual('send-message-to-messenger')
    })
  })

  describe('.kindToMessageKind', () => {
    it('returns text if kind is text', () => {
      expect(Jivochat.kindToMessageKind('text')).toEqual('text')
    })

    it('returns file if kind is video', () => {
      expect(Jivochat.kindToMessageKind('video')).toEqual('file')
    })

    it('returns file if kind is audio', () => {
      expect(Jivochat.kindToMessageKind('audio')).toEqual('file')
    })

    it('returns file if kind is voice', () => {
      expect(Jivochat.kindToMessageKind('voice')).toEqual('file')
    })

    it('returns file if kind is photo', () => {
      expect(Jivochat.kindToMessageKind('photo')).toEqual('file')
    })

    it('returns file if kind is document', () => {
      expect(Jivochat.kindToMessageKind('document')).toEqual('file')
    })

    it('returns file if kind is sticker', () => {
      expect(Jivochat.kindToMessageKind('sticker')).toEqual('file')
    })

    it('returns location if kind is location', () => {
      expect(Jivochat.kindToMessageKind('location')).toEqual('location')
    })
  })

  describe('.messageType', () => {
    it('returns "photo" if fileUrl is photo', () => {
      expect(Jivochat.messageType('file.jpg')).toEqual('photo')
    })

    it('returns "video" if fileUrl is video', () => {
      expect(Jivochat.messageType('file.mpg')).toEqual('video')
    })

    it('returns "audio" if fileUrl is audio', () => {
      expect(Jivochat.messageType('file.ogg')).toEqual('audio')
    })

    it('returns "voice" if fileUrl is voice', () => {
      expect(Jivochat.messageType('file.opus')).toEqual('voice')
    })

    it('returns "document" if fileUrl is another extension', () => {
      expect(Jivochat.messageType('file.txt')).toEqual('document')
    })
  })
})
