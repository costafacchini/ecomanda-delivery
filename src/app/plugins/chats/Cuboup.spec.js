import { Cuboup } from './Cuboup.js'
import Trigger from '@models/Trigger'
import mongoServer from '../../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { triggerReplyButton as triggerReplyButtonFactory } from '@factories/trigger'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'
import request from '../../services/request.js'

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))
jest.mock('../../services/request')

describe('Cuboup plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build({ phone: '554891231231' }))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#responseToMessages', () => {
    it('returns the response body transformed in messages', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: true,
          licensee,
        }),
      )

      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5511990283745@c.us',
        },
        message: {
          type: 'text',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const cuboup = new Cuboup(licensee)
      const messages = await cuboup.responseToMessages(responseBody)

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

      expect(messages.length).toEqual(1)
    })

    it('return the empty data if body is blank', async () => {
      const responseBody = {}

      const cuboup = new Cuboup(licensee)
      const message = await cuboup.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if body does not have a message', async () => {
      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5511990283745@c.us',
        },
      }

      const cuboup = new Cuboup(licensee)
      const message = await cuboup.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if body does not have a recipient', async () => {
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

      const cuboup = new Cuboup(licensee)
      const message = await cuboup.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if type is typein', async () => {
      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5511990283745@c.us',
        },
        message: {
          type: 'typein',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const cuboup = new Cuboup(licensee)
      const message = await cuboup.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if type is typeout', async () => {
      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5511990283745@c.us',
        },
        message: {
          type: 'typeout',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const cuboup = new Cuboup(licensee)
      const message = await cuboup.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    it('return the empty data if type is stop', async () => {
      const responseBody = {
        sender: {
          name: 'Mary Jane',
        },
        recipient: {
          id: '5511990283745@c.us',
        },
        message: {
          type: 'stop',
          id: 'jivo_message_id',
          text: 'Hello world',
        },
      }

      const cuboup = new Cuboup(licensee)
      const message = await cuboup.responseToMessages(responseBody)

      expect(message).toEqual([])
    })

    describe('message types', () => {
      it('returns messages with file data if it is file', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          }),
        )

        const responseBody = {
          sender: {
            name: 'Mary Jane',
          },
          recipient: {
            id: '5511990283745@c.us',
          },
          message: {
            type: 'video',
            id: 'jivo_message_id',
            file: 'https://octodex.github.com/images/dojocat.jpg',
            file_name: 'dojocat.jpg',
          },
        }

        const cuboup = new Cuboup(licensee)
        const messages = await cuboup.responseToMessages(responseBody)

        expect(messages[0].kind).toEqual('file')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual('https://octodex.github.com/images/dojocat.jpg')
        expect(messages[0].fileName).toEqual('dojocat.jpg')
      })

      it('returns messages with coordinates data if it is location', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          }),
        )

        const responseBody = {
          sender: {
            name: 'Mary Jane',
          },
          recipient: {
            id: '5511990283745@c.us',
          },
          message: {
            type: 'location',
            id: 'jivo_message_id',
            latitude: 123.93,
            longitude: 12.0,
          },
        }

        const cuboup = new Cuboup(licensee)
        const messages = await cuboup.responseToMessages(responseBody)

        expect(messages[0].kind).toEqual('location')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].latitude).toEqual(123.93)
        expect(messages[0].longitude).toEqual(12.0)
      })

      it('logs the info and return empty data if kind is unknown', async () => {
        const responseBody = {
          sender: {
            name: 'Mary Jane',
          },
          recipient: {
            id: '5511990283745@c.us',
          },
          message: {
            type: 'any',
            id: 'jivo_message_id',
            text: 'Hello world',
          },
        }

        const cuboup = new Cuboup(licensee)
        const message = await cuboup.responseToMessages(responseBody)

        expect(consoleInfoSpy).toHaveBeenCalledWith('Tipo de mensagem retornado pela CuboUp não reconhecido: any')

        expect(message).toEqual([])
      })

      it('returns messages with interactive data if it is text with trigger expression', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          }),
        )

        const triggerOrder2 = await Trigger.create(triggerReplyButtonFactory.build({ licensee, order: 2 }))
        const trigger = await Trigger.create(triggerReplyButtonFactory.build({ licensee }))

        const responseBody = {
          sender: {
            name: 'Mary Jane',
          },
          recipient: {
            id: '5511990283745@c.us',
          },
          message: {
            type: 'text',
            id: 'jivo_message_id',
            text: 'send_reply_buttons',
          },
        }

        const cuboup = new Cuboup(licensee)
        const messages = await cuboup.responseToMessages(responseBody)

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
        const contactRepository = new ContactRepositoryDatabase()
        await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          }),
        )

        const responseBody = {
          sender: {
            name: 'Mary Jane',
          },
          recipient: {
            id: '5511990283745@c.us',
          },
          message: {
            type: 'text',
            id: 'jivo_message_id',
            text: '{{name}}',
          },
        }

        const cuboup = new Cuboup(licensee)
        const messages = await cuboup.responseToMessages(responseBody)

        expect(messages[0].kind).toEqual('template')
        expect(messages[0].text).toEqual('{{name}}')
      })
    })
  })

  describe('#sendMessage', () => {
    describe('when response status is 200', () => {
      it('marks the message with sended', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            email: 'john@doe.com',
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        const expectedBody = {
          recipient: {
            id: '5548991231231',
          },
          sender: {
            id: '5511990283745@c.us',
            name: 'John Doe',
            email: 'john@doe.com',
            phone: '5511990283745',
          },
          message: {
            id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            type: 'text',
            text: 'Message to send',
          },
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {},
        })

        expect(message.sended).toEqual(false)

        const cuboup = new Cuboup(licensee)
        await cuboup.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')

        expect(request.post).toHaveBeenCalledWith(
          'https://url.com.br/jkJGs5a4ea/pAOqw2340',
          expect.objectContaining({
            body: expectedBody,
          }),
        )

        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })

      it('logs the success message', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            email: 'john@doe.com',
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        const expectedBody = {
          recipient: {
            id: '5548991231231',
          },
          sender: {
            id: '5511990283745@c.us',
            name: 'John Doe',
            email: 'john@doe.com',
            phone: '5511990283745',
          },
          message: {
            id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            type: 'text',
            text: 'Message to send',
          },
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {},
        })

        expect(message.sended).toEqual(false)

        const cuboup = new Cuboup(licensee)
        await cuboup.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 enviada para CuboUp com sucesso!',
        )
      })

      describe('when message is for group', () => {
        it('send message formatted to group', async () => {
          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create({
            name: 'Grupo Teste',
            number: '5511989187726-1622497000@g.us',
            type: '@g.us',
            talkingWithChatBot: true,
            email: 'john@doe.com',
            licensee: licensee,
          })

          const messageRepository = new MessageRepositoryDatabase()
          const message = await messageRepository.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
              senderName: 'John Doe',
            }),
          )

          const expectedBody = {
            recipient: {
              id: '5548991231231',
            },
            sender: {
              id: '5511989187726-1622497000@g.us',
              name: 'Grupo Teste',
              email: 'john@doe.com',
            },
            message: {
              id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
              type: 'text',
              text: 'John Doe:\nMessage to send\n.',
            },
          }

          request.post.mockResolvedValueOnce({
            status: 200,
            data: {},
          })

          expect(message.sended).toEqual(false)

          const cuboup = new Cuboup(licensee)
          await cuboup.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
          const messageUpdated = await messageRepository.findFirst({ _id: message._id })
          expect(messageUpdated.sended).toEqual(true)
        })
      })
    })

    describe('when response is not 200', () => {
      it('logs the error message and save error on message', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            email: 'john@doe.com',
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        const expectedBody = {
          recipient: {
            id: '5548991231231',
          },
          sender: {
            id: '5511990283745@c.us',
            name: 'John Doe',
            email: 'john@doe.com',
            phone: '5511990283745',
          },
          message: {
            id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
            type: 'text',
            text: 'Message to send',
          },
        }

        request.post.mockResolvedValueOnce({
          status: 404,
          data: { error: 'Error message' },
        })

        expect(message.sended).toEqual(false)

        const cuboup = new Cuboup(licensee)
        await cuboup.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(false)
        expect(messageUpdated.error).toEqual('mensagem: {"error":"Error message"}')

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Mensagem 60958703f415ed4008748637 não enviada para CuboUp.
           status: 404
           mensagem: {"error":"Error message"}`,
        )
      })
    })

    describe('message types', () => {
      describe('when message is location', () => {
        it('sends the message with location', async () => {
          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              email: 'john@doe.com',
              licensee,
            }),
          )

          const messageRepository = new MessageRepositoryDatabase()
          const message = await messageRepository.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
              kind: 'location',
              latitude: 10.2,
              longitude: 123.45,
            }),
          )

          const expectedBody = {
            recipient: {
              id: '5548991231231',
            },
            sender: {
              id: '5511990283745@c.us',
              name: 'John Doe',
              email: 'john@doe.com',
              phone: '5511990283745',
            },
            message: {
              id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
              type: 'location',
              latitude: 10.2,
              longitude: 123.45,
            },
          }

          request.post.mockResolvedValueOnce({
            status: 200,
            data: {},
          })

          const cuboup = new Cuboup(licensee)
          await cuboup.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
        })
      })

      describe('when message is text', () => {
        it('sends the message with text', async () => {
          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              email: 'john@doe.com',
              licensee,
            }),
          )

          const messageRepository = new MessageRepositoryDatabase()
          const message = await messageRepository.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
            }),
          )

          const expectedBody = {
            recipient: {
              id: '5548991231231',
            },
            sender: {
              id: '5511990283745@c.us',
              name: 'John Doe',
              email: 'john@doe.com',
              phone: '5511990283745',
            },
            message: {
              id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
              type: 'text',
              text: 'Message to send',
            },
          }

          request.post.mockResolvedValueOnce({
            status: 200,
            data: {},
          })

          expect(message.sended).toEqual(false)

          const cuboup = new Cuboup(licensee)
          await cuboup.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
        })
      })

      describe('when message is file', () => {
        it('sends the message with file', async () => {
          const contactRepository = new ContactRepositoryDatabase()
          const contact = await contactRepository.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              email: 'john@doe.com',
              licensee,
            }),
          )

          const messageRepository = new MessageRepositoryDatabase()
          const message = await messageRepository.create(
            messageFactory.build({
              text: 'Message to send',
              contact,
              licensee,
              sended: false,
              kind: 'file',
              url: 'https://message.with.file.com/file.txt',
              fileName: 'file.txt',
            }),
          )

          const expectedBody = {
            recipient: {
              id: '5548991231231',
            },
            sender: {
              id: '5511990283745@c.us',
              name: 'John Doe',
              email: 'john@doe.com',
              phone: '5511990283745',
            },
            message: {
              id: '150bdb15-4c55-42ac-bc6c-970d620fdb6d',
              type: 'document',
              file: 'https://message.with.file.com/file.txt',
              file_name: 'file.txt',
            },
          }

          request.post.mockResolvedValueOnce({
            status: 200,
            data: {},
          })

          expect(message.sended).toEqual(false)

          const cuboup = new Cuboup(licensee)
          await cuboup.sendMessage(message._id, 'https://url.com.br/jkJGs5a4ea/pAOqw2340')
        })
      })
    })
  })

  describe('#transfer', () => {
    it('changes the talking with chatbot in contact to false', async () => {
      jest.spyOn(Cuboup.prototype, 'sendMessage').mockImplementation()
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: true,
          licensee,
        }),
      )

      const messageRepository = new MessageRepositoryDatabase()
      const message = await messageRepository.create(
        messageFactory.build({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          contact,
          licensee,
          sended: false,
        }),
      )

      expect(contact.talkingWithChatBot).toEqual(true)

      const cuboup = new Cuboup(licensee)
      await cuboup.transfer(message._id, 'url')

      const modifiedContact = await contactRepository.findFirst({ _id: contact._id })
      expect(modifiedContact.talkingWithChatBot).toEqual(false)
    })

    it('sends message to chat', async () => {
      const sendMessageSpy = jest.spyOn(Cuboup.prototype, 'sendMessage').mockImplementation()
      const contactRepository = new ContactRepositoryDatabase()
      const contact = await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: true,
          licensee,
        }),
      )

      const messageRepository = new MessageRepositoryDatabase()
      const message = await messageRepository.create(
        messageFactory.build({
          _id: '60958703f415ed4008748637',
          text: 'Message to send',
          contact,
          licensee,
          sended: false,
        }),
      )

      const cuboup = new Cuboup(licensee)
      await cuboup.transfer(message._id.toString(), 'url')

      expect(sendMessageSpy).toHaveBeenCalledTimes(1)
      expect(sendMessageSpy).toHaveBeenCalledWith('60958703f415ed4008748637', 'url')
    })
  })

  describe('#closeChat', () => {
    describe('when the licensee use chatbot', () => {
      it('changes the talking with chatbot in contact to true', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(
          licenseeFactory.build({
            useChatbot: true,
            chatbotDefault: 'landbot',
            chatbotUrl: 'https://url.com',
            chatbotAuthorizationToken: 'token',
          }),
        )

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            email: 'john@doe.com',
            roomId: 'ka3DiV9CuHD765',
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        expect(contact.talkingWithChatBot).toEqual(false)

        const cuboup = new Cuboup(licensee)
        await cuboup.closeChat(message._id)

        const modifiedContact = await contactRepository.findFirst({ _id: contact._id })
        expect(modifiedContact.talkingWithChatBot).toEqual(true)
      })
    })

    describe('when the licensee has a message on close chat', () => {
      it('creates the messages to send to messenger before close chat', async () => {
        const licenseeRepository = new LicenseeRepositoryDatabase()
        const licensee = await licenseeRepository.create(
          licenseeFactory.build({
            useChatbot: true,
            chatbotDefault: 'landbot',
            chatbotUrl: 'https://url.com',
            chatbotAuthorizationToken: 'token',
            messageOnCloseChat: 'Send on close chat',
          }),
        )

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            email: 'john@doe.com',
            roomId: 'ka3DiV9CuHD765',
            licensee,
          }),
        )

        const messageRepository = new MessageRepositoryDatabase()
        const message = await messageRepository.create(
          messageFactory.build({
            _id: '60958703f415ed4008748637',
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
          }),
        )

        expect(contact.talkingWithChatBot).toEqual(false)

        const cuboup = new Cuboup(licensee)
        const messages = await cuboup.closeChat(message._id)

        const modifiedContact = await contactRepository.findFirst({ _id: contact._id })
        expect(modifiedContact.talkingWithChatBot).toEqual(true)

        expect(messages.length).toEqual(1)
        expect(messages[0].text).toEqual('Send on close chat')
      })
    })
  })

  describe('#action', () => {
    it('returns "close-chat" if message is "Chat encerrado pelo agente"', () => {
      const responseBody = {
        message: {
          text: 'Chat encerrado pelo agente',
        },
      }

      const cuboup = new Cuboup(licensee)
      expect(cuboup.action(responseBody)).toEqual('close-chat')
    })

    it('returns "close-chat" if message is "Chat closed by agent"', () => {
      const responseBody = {
        message: {
          text: 'Chat closed by agent',
        },
      }

      const cuboup = new Cuboup(licensee)
      expect(cuboup.action(responseBody)).toEqual('close-chat')
    })

    it('returns "send-message-to-messenger" if message is not "Chat closed by agent" and "Chat closed by agent"', () => {
      const responseBody = {
        message: {
          text: 'Message',
        },
      }

      const cuboup = new Cuboup(licensee)
      expect(cuboup.action(responseBody)).toEqual('send-message-to-messenger')
    })
  })

  describe('.kindToMessageKind', () => {
    it('returns text if kind is text', () => {
      expect(Cuboup.kindToMessageKind('text')).toEqual('text')
    })

    it('returns file if kind is video', () => {
      expect(Cuboup.kindToMessageKind('video')).toEqual('file')
    })

    it('returns file if kind is audio', () => {
      expect(Cuboup.kindToMessageKind('audio')).toEqual('file')
    })

    it('returns file if kind is voice', () => {
      expect(Cuboup.kindToMessageKind('voice')).toEqual('file')
    })

    it('returns file if kind is photo', () => {
      expect(Cuboup.kindToMessageKind('photo')).toEqual('file')
    })

    it('returns file if kind is document', () => {
      expect(Cuboup.kindToMessageKind('document')).toEqual('file')
    })

    it('returns file if kind is sticker', () => {
      expect(Cuboup.kindToMessageKind('sticker')).toEqual('file')
    })

    it('returns location if kind is location', () => {
      expect(Cuboup.kindToMessageKind('location')).toEqual('location')
    })
  })

  describe('.messageType', () => {
    it('returns "photo" if fileUrl is photo', () => {
      expect(Cuboup.messageType('file.jpg')).toEqual('photo')
    })

    it('returns "video" if fileUrl is video', () => {
      expect(Cuboup.messageType('file.mpg')).toEqual('video')
    })

    it('returns "audio" if fileUrl is audio', () => {
      expect(Cuboup.messageType('file.ogg')).toEqual('audio')
    })

    it('returns "voice" if fileUrl is voice', () => {
      expect(Cuboup.messageType('file.opus')).toEqual('voice')
    })

    it('returns "document" if fileUrl is another extension', () => {
      expect(Cuboup.messageType('file.txt')).toEqual('document')
    })
  })
})
