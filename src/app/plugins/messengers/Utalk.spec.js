import { Utalk } from './Utalk.js'
import mongoServer from '../../../../.jest/utils'
import { S3 } from '../storage/S3.js'
import { licensee as licenseeFactory } from '@factories/licensee'
import { contact as contactFactory } from '@factories/contact'
import { message as messageFactory } from '@factories/message'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { ContactRepositoryDatabase } from '@repositories/contact'
import { MessageRepositoryDatabase } from '@repositories/message'
import request from '../../services/request.js'
import { logger } from '../../../setup/logger.js'

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))
jest.mock('../../services/request')
jest.mock('../../../setup/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}))

describe('Utalk plugin', () => {
  let licensee
  const uploadFileS3Spy = jest.spyOn(S3.prototype, 'uploadFile').mockImplementation()
  const presignedUrlS3Spy = jest.spyOn(S3.prototype, 'presignedUrl').mockImplementation(() => {
    return 'https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg'
  })

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#responseToMessages', () => {
    describe('image and text', () => {
      it('returns the response body transformed in messages with only text message', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5511990283745',
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

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

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
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const responseBody = {
          event: 'file',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          fn: '1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
          blob: 'data:image/jpeg;base64,/9j/4AAQSkZJRgA...',
          dir: 'i',
          user: '5511940650658',
          number: '5511990283745',
          uid: '3EB016638A2AD49A9ECE',
        }

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

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

      it('return the empty data if dir is o', async () => {
        const responseBody = {
          event: 'file',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          fn: '1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
          blob: 'data:image/jpeg;base64,/9j/4AAQSkZJRgA...',
          dir: 'o',
          user: '5511940650658',
          number: '5511990283745',
          uid: '3EB016638A2AD49A9ECE',
        }

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

        expect(messages.length).toEqual(0)
      })
    })

    describe('text', () => {
      it('returns the response body transformed in messages', async () => {
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5511990283745',
          'contact[name]': 'John Doe',
          'contact[server]': 'c.us',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'i',
          'chat[type]': 'chat',
          'chat[body]': 'Message to send',
          ack: '-1',
        }

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

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
        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.create(
          contactFactory.build({
            name: 'Grupo Teste',
            number: '5511989187726-1622497000@g.us',
            type: '@g.us',
            talkingWithChatBot: false,
            licensee,
          }),
        )

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5511990283745',
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

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

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
      it('returns messages empty if message kind is ack', async () => {
        const responseBody = {
          event: 'ack',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
        }

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

        expect(messages.length).toEqual(0)
      })
    })

    describe('login', () => {
      it('returns messages empty if message kind is login', async () => {
        const responseBody = {
          event: 'login',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
        }

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

        expect(messages.length).toEqual(0)
      })
    })

    it('updates the contact if contact exists, name is different and message is not file', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(
        licenseeFactory.build({
          useChatbot: true,
          chatbotDefault: 'landbot',
          chatbotUrl: 'https://teste-url.com',
          chatbotAuthorizationToken: 'token',
          apiToken: '12346554',
        }),
      )

      const contactRepository = new ContactRepositoryDatabase()
      await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          licensee,
        }),
      )

      const responseBody = {
        event: 'chat',
        token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
        user: '5511940650658',
        'contact[number]': '5511990283745',
        'contact[name]': 'Jonny Cash',
        'contact[server]': 'c.us',
        'chat[dtm]': '1603582444',
        'chat[uid]': '3EB016638A2AD49A9ECE',
        'chat[dir]': 'i',
        'chat[type]': 'chat',
        'chat[body]': 'Message to send',
        ack: '-1',
      }

      const utalk = new Utalk(licensee)
      await utalk.responseToMessages(responseBody)

      const contactUpdated = await contactRepository.findFirst({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.name).toEqual('Jonny Cash')
      expect(contactUpdated.talkingWithChatBot).toEqual(true)
    })

    it('does not update the contact if contact exists, name is different and message is file', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          licensee,
        }),
      )

      const responseBody = {
        event: 'file',
        token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
        fn: '1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
        blob: 'data:image/jpeg;base64,/9j/4AAQSkZJRgA...',
        dir: 'i',
        user: '5511940650658',
        number: '5511990283745',
        uid: '3EB016638A2AD49A9ECE',
      }

      const utalk = new Utalk(licensee)
      await utalk.responseToMessages(responseBody)

      const contactUpdated = await contactRepository.findFirst({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.name).toEqual('John Doe')
    })

    it('does not update the contact if contact exists and body name is undefined', async () => {
      const contactRepository = new ContactRepositoryDatabase()
      await contactRepository.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          licensee,
        }),
      )

      const responseBody = {
        event: 'chat',
        token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
        user: '5511940650658',
        'contact[number]': '5511990283745',
        'contact[server]': 'c.us',
        'chat[dtm]': '1603582444',
        'chat[uid]': '3EB016638A2AD49A9ECE',
        'chat[dir]': 'i',
        'chat[type]': 'chat',
        'chat[body]': 'Message to send',
        ack: '-1',
      }

      const utalk = new Utalk(licensee)
      await utalk.responseToMessages(responseBody)

      const contactUpdated = await contactRepository.findFirst({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.name).toEqual('John Doe')
    })

    describe('when the contact does not exists', () => {
      it('registers the contact and return the response body transformed in messages', async () => {
        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5511990283745',
          'contact[name]': 'John Doe',
          'contact[server]': 'c.us',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'i',
          'chat[type]': 'chat',
          'chat[body]': 'Message to send',
          ack: '-1',
        }

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.findFirst({
          number: '5511990283745',
          type: '@c.us',
          licensee: licensee._id,
        })

        expect(contact.name).toEqual('John Doe')
        expect(contact.number).toEqual('5511990283745')
        expect(contact.type).toEqual('@c.us')
        expect(contact.talkingWithChatBot).toEqual(licensee.useChatbot)
        expect(contact.licensee).toEqual(licensee._id)
        expect(contact.wa_start_chat).toEqual(undefined)

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
        const responseBody = {
          event: 'file',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          fn: '1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg',
          blob: 'data:image/jpeg;base64,/9j/4AAQSkZJRgA...',
          dir: 'i',
          user: '5511940650658',
          number: '5511990283745',
          uid: '3EB016638A2AD49A9ECE',
        }

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

        const contactRepository = new ContactRepositoryDatabase()
        const contact = await contactRepository.findFirst({
          number: '5511990283745',
          type: '@c.us',
          licensee: licensee._id,
        })

        expect(contact.name).toEqual('5511990283745')
        expect(contact.number).toEqual('5511990283745')
        expect(contact.type).toEqual('@c.us')
        expect(contact.talkingWithChatBot).toEqual(licensee.useChatbot)
        expect(contact.licensee).toEqual(licensee._id)

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
        const contactRepository = new ContactRepositoryDatabase()
        await contactRepository.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
          }),
        )

        const responseBody = {
          event: 'chat',
          token: 'AkkIoqx9AeEu900HOUvUTGqhxcXnmOSsTygT',
          user: '5511940650658',
          'contact[number]': '5511990283745',
          'contact[name]': 'John Doe',
          'contact[server]': 'c.us',
          'chat[dtm]': '1603582444',
          'chat[uid]': '3EB016638A2AD49A9ECE',
          'chat[dir]': 'i',
          'chat[type]': 'chat',
          'chat[body]': 'Message to send',
          ack: '-1',
        }

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

        expect(messages[0].destination).toEqual('to-chatbot')

        expect(messages.length).toEqual(1)
      })
    })

    describe('when the message is from me', () => {
      it('returns the response body transformed in message ignoring the message from me', async () => {
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

        const utalk = new Utalk(licensee)
        const messages = await utalk.responseToMessages(responseBody)

        expect(messages.length).toEqual(0)
      })
    })

    it('return the empty data if body is blank', async () => {
      const responseBody = {}

      const utalk = new Utalk(licensee)
      const messages = await utalk.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty data if event is chat and chat type is not chat and has no caption', async () => {
      const responseBody = {
        event: 'chat',
        'chat[type]': 'file',
      }

      const utalk = new Utalk(licensee)
      const messages = await utalk.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })
  })

  describe('#sendMessage', () => {
    describe('when the message was sent', () => {
      it('marks the message with was sent', async () => {
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

        const expectedBody = {
          cmd: 'chat',
          id: '60958703f415ed4008748637',
          to: '5511990283745@c.us',
          msg: 'Message to send',
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
            type: 'send message',
            cmd: 'chat',
            to: '5511990283745@c.us',
            servidor: 'res_utalk',
          },
        })

        expect(message.sended).toEqual(false)

        const utalk = new Utalk(licensee)
        await utalk.sendMessage(message._id, 'https://api.utalk.com.br/send/', 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K')
        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(true)
      })

      it('logs the success message', async () => {
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

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
            type: 'send message',
            cmd: 'chat',
            to: '5511990283745@c.us',
            token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
            servidor: 'res_utalk',
          },
        })

        expect(message.sended).toEqual(false)

        const utalk = new Utalk(licensee)
        await utalk.sendMessage(message._id, 'https://api.utalk.com.br/send/', 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K')
        expect(logger.info).toHaveBeenCalledWith('Mensagem 60958703f415ed4008748637 enviada para Utalk com sucesso!', {
          type: 'send message',
          cmd: 'chat',
          to: '5511990283745@c.us',
          token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
          servidor: 'res_utalk',
        })
      })

      describe('when the message is file', () => {
        it('marks the message with sended and log the success message', async () => {
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
              kind: 'file',
              url: 'https://octodex.github.com/images/dojocat.jpg',
              fileName: 'dojocat.jpg',
              contact,
              licensee,
              sended: false,
            }),
          )

          const expectedBody = {
            cmd: 'media',
            id: '60958703f415ed4008748637',
            to: '5511990283745@c.us',
            msg: 'Message to send',
            link: 'https://octodex.github.com/images/dojocat.jpg',
          }

          request.post.mockResolvedValueOnce({
            status: 200,
            data: {
              type: 'send message',
              cmd: 'chat',
              to: '5511990283745@c.us',
              token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
              servidor: 'res_utalk',
            },
          })

          expect(message.sended).toEqual(false)

          const utalk = new Utalk(licensee)
          await utalk.sendMessage(message._id, 'https://api.utalk.com.br/send/', 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K')
          const messageUpdated = await messageRepository.findFirst({ _id: message._id })
          expect(messageUpdated.sended).toEqual(true)

          expect(logger.info).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Utalk com sucesso!',
            {
              type: 'send message',
              cmd: 'chat',
              to: '5511990283745@c.us',
              token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
              servidor: 'res_utalk',
            },
          )
        })
      })
    })

    describe('when can not send the message', () => {
      it('logs the error message', async () => {
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

        const expectedBody = {
          cmd: 'chat',
          id: '60958703f415ed4008748637',
          to: '5511990283745@c.us',
          msg: 'Message to send',
        }

        request.post.mockResolvedValueOnce({
          status: 200,
          data: {
            type: 'send message',
            token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
            status: 'whatsapp offline',
          },
        })

        expect(message.sended).toEqual(false)

        const utalk = new Utalk(licensee)
        await utalk.sendMessage(message._id, 'https://api.utalk.com.br/send/', 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K')
        const messageUpdated = await messageRepository.findFirst({ _id: message._id })
        expect(messageUpdated.sended).toEqual(false)
        expect(messageUpdated.error).toEqual(
          '{"type":"send message","token":"WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K","status":"whatsapp offline"}',
        )

        expect(logger.error).toHaveBeenCalledWith('Mensagem 60958703f415ed4008748637 não enviada para Utalk.', {
          type: 'send message',
          token: 'WTIgtlBwDk4kJNv7oMMderfTWihceFm2mI9K',
          status: 'whatsapp offline',
        })
      })
    })
  })

  describe('#action', () => {
    it('returns send-message-to-chat if message destination is to chat', () => {
      const utalk = new Utalk(licensee)

      expect(utalk.action('to-chat')).toEqual('send-message-to-chat')
    })

    it('returns send-message-to-chatbot if message destination is to chatbot', () => {
      const utalk = new Utalk(licensee)

      expect(utalk.action('to-chatbot')).toEqual('send-message-to-chatbot')
    })
  })
})
