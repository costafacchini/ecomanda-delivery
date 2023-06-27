const Dialog = require('./Dialog')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const Trigger = require('@models/Trigger')
const Template = require('@models/Template')
const Cart = require('@models/Cart')
const Product = require('@models/Product')
const fetchMock = require('fetch-mock')
const mongoServer = require('../../../../.jest/utils')
const S3 = require('../storage/S3')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')
const {
  triggerReplyButton: triggerReplyButtonFactory,
  triggerMultiProduct: triggerMultiProductFactory,
  triggerListMessage: triggerListMessageFactory,
  triggerSingleProduct: triggerSingleProductFactory,
  triggerText: triggerTextFactory,
} = require('@factories/trigger')
const { template: templateFactory } = require('@factories/template')
const { cart: cartFactory } = require('@factories/cart')
const { product: productFactory } = require('@factories/product')
const { advanceTo, clear } = require('jest-date-mock')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Dialog plugin', () => {
  let licensee
  const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation()
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation()
  const uploadFileS3Spy = jest.spyOn(S3.prototype, 'uploadFile').mockImplementation()
  const presignedUrlS3Spy = jest.spyOn(S3.prototype, 'presignedUrl').mockImplementation(() => {
    return 'https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg'
  })

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
    fetchMock.reset()

    licensee = await Licensee.create(licenseeFactory.build({ whatsappToken: 'whats-token' }))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#responseToMessages', () => {
    describe('text', () => {
      it('returns the response body transformed in messages', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              text: {
                body: 'Message',
              },
              timestamp: '1632784639',
              type: 'text',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual('Message')
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })
    })

    describe('button', () => {
      it('returns the response body transformed in messages', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              button: {
                text: 'Message',
              },
              context: {
                from: '5511989187726',
                id: 'ABGHVRGYkYdybwIQ0bTVCg1c-CuSSZXzTHxosg',
              },
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              timestamp: '1632784639',
              type: 'button',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual('Message')
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
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              image: {
                id: 'image-media-id',
                sha256: 'sha256',
              },
              timestamp: '1632784639',
              type: 'image',
            },
          ],
        }

        fetchMock.getOnce(
          (url) => {
            return url === 'https://waba.360dialog.io/v1/media/image-media-id'
          },
          {
            status: 200,
            headers: {
              'content-type': 'image/jpeg',
            },
            body: Buffer.from('test'),
          }
        )

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].attachmentWaId).toEqual('image-media-id')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual('https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].fileName).toEqual('sha256')
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)
        expect(uploadFileS3Spy).toHaveBeenCalledTimes(1)
        expect(presignedUrlS3Spy).toHaveBeenCalledTimes(1)

        expect(messages.length).toEqual(1)
      })
    })

    describe('video', () => {
      it('returns the response body transformed in messages', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              video: {
                id: 'image-media-id',
                sha256: 'sha256',
              },
              timestamp: '1632784639',
              type: 'video',
            },
          ],
        }

        fetchMock.getOnce(
          (url) => {
            return url === 'https://waba.360dialog.io/v1/media/image-media-id'
          },
          {
            status: 200,
            headers: {
              'content-type': 'video/mov',
            },
            body: Buffer.from('test'),
          }
        )

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].attachmentWaId).toEqual('image-media-id')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual('https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].fileName).toEqual('sha256')
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)
        expect(uploadFileS3Spy).toHaveBeenCalledTimes(1)
        expect(presignedUrlS3Spy).toHaveBeenCalledTimes(1)

        expect(messages.length).toEqual(1)
      })
    })

    describe('voice', () => {
      it('returns the response body transformed in messages', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              voice: {
                id: 'image-media-id',
                sha256: 'sha256',
              },
              timestamp: '1632784639',
              type: 'voice',
            },
          ],
        }

        fetchMock.getOnce(
          (url) => {
            return url === 'https://waba.360dialog.io/v1/media/image-media-id'
          },
          {
            status: 200,
            headers: {
              'content-type': 'voice/ogg',
            },
            body: Buffer.from('test'),
          }
        )

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].attachmentWaId).toEqual('image-media-id')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual('https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].fileName).toEqual('sha256')
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)
        expect(uploadFileS3Spy).toHaveBeenCalledTimes(1)
        expect(presignedUrlS3Spy).toHaveBeenCalledTimes(1)

        expect(messages.length).toEqual(1)
      })
    })

    describe('audio', () => {
      it('returns the response body transformed in messages', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              audio: {
                id: 'image-media-id',
                sha256: 'sha256',
              },
              timestamp: '1632784639',
              type: 'audio',
            },
          ],
        }

        fetchMock.getOnce(
          (url) => {
            return url === 'https://waba.360dialog.io/v1/media/image-media-id'
          },
          {
            status: 200,
            headers: {
              'content-type': 'audio/mp3',
            },
            body: Buffer.from('test'),
          }
        )

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].attachmentWaId).toEqual('image-media-id')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual('https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].fileName).toEqual('sha256')
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)
        expect(uploadFileS3Spy).toHaveBeenCalledTimes(1)
        expect(presignedUrlS3Spy).toHaveBeenCalledTimes(1)

        expect(messages.length).toEqual(1)
      })
    })

    describe('document', () => {
      it('returns the response body transformed in messages', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              document: {
                id: 'image-media-id',
                filename: 'documento.pdf',
              },
              timestamp: '1632784639',
              type: 'document',
            },
          ],
        }

        fetchMock.getOnce(
          (url) => {
            return url === 'https://waba.360dialog.io/v1/media/image-media-id'
          },
          {
            status: 200,
            headers: {
              'content-type': 'application/pdf',
            },
            body: Buffer.from('test'),
          }
        )

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('file')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].attachmentWaId).toEqual('image-media-id')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].senderName).toEqual(undefined)
        expect(messages[0].url).toEqual('https://s3.url.com/1c18498a-f953-41c2-9c56-8a22b89510d3.jpeg')
        expect(messages[0].fileName).toEqual('documento.pdf')
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)
        expect(uploadFileS3Spy).toHaveBeenCalledTimes(1)
        expect(presignedUrlS3Spy).toHaveBeenCalledTimes(1)

        expect(messages.length).toEqual(1)
      })
    })

    describe('interactive list_reply', () => {
      it('returns the response body transformed in messages', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const triggerOrder2 = await Trigger.create(triggerReplyButtonFactory.build({ licensee, order: 2 }))
        const trigger = await Trigger.create(triggerReplyButtonFactory.build({ licensee }))

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              timestamp: '1632784639',
              type: 'interactive',
              interactive: {
                list_reply: {
                  description: 'Descrição 2',
                  id: 'send_reply_buttons',
                  title: 'Opção 2',
                },
                type: 'list_reply',
              },
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('interactive')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-messenger')
        expect(messages[0].trigger).toEqual(trigger._id)
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages[1]).toBeInstanceOf(Message)
        expect(messages[1].licensee).toEqual(licensee._id)
        expect(messages[1].contact).toEqual(contact._id)
        expect(messages[1].kind).toEqual('interactive')
        expect(messages[1].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[1].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[1].destination).toEqual('to-messenger')
        expect(messages[1].trigger).toEqual(triggerOrder2._id)
        expect(messages[1].text).toEqual(undefined)
        expect(messages[1].url).toEqual(undefined)
        expect(messages[1].fileName).toEqual(undefined)
        expect(messages[1].latitude).toEqual(undefined)
        expect(messages[1].longitude).toEqual(undefined)
        expect(messages[1].departament).toEqual(undefined)

        expect(messages.length).toEqual(2)
      })

      it('returns message with text if does not have trigger', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              timestamp: '1632784639',
              type: 'interactive',
              interactive: {
                list_reply: {
                  description: 'Descrição 2',
                  id: 'send_reply_buttons',
                  title: 'Opção 2',
                },
                type: 'list_reply',
              },
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].trigger).toEqual(undefined)
        expect(messages[0].text).toEqual('send_reply_buttons')
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })
    })

    describe('interactive button_reply', () => {
      it('returns the response body transformed in messages', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const triggerOrder2 = await Trigger.create(triggerReplyButtonFactory.build({ licensee, order: 2 }))
        const trigger = await Trigger.create(triggerReplyButtonFactory.build({ licensee }))

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              timestamp: '1632784639',
              type: 'interactive',
              interactive: {
                button_reply: {
                  id: 'send_reply_buttons',
                  title: 'Opção 2',
                },
                type: 'button_reply',
              },
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('interactive')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-messenger')
        expect(messages[0].trigger).toEqual(trigger._id)
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages[1]).toBeInstanceOf(Message)
        expect(messages[1].licensee).toEqual(licensee._id)
        expect(messages[1].contact).toEqual(contact._id)
        expect(messages[1].kind).toEqual('interactive')
        expect(messages[1].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[1].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[1].destination).toEqual('to-messenger')
        expect(messages[1].trigger).toEqual(triggerOrder2._id)
        expect(messages[1].text).toEqual(undefined)
        expect(messages[1].url).toEqual(undefined)
        expect(messages[1].fileName).toEqual(undefined)
        expect(messages[1].latitude).toEqual(undefined)
        expect(messages[1].longitude).toEqual(undefined)
        expect(messages[1].departament).toEqual(undefined)

        expect(messages.length).toEqual(2)
      })

      it('returns message with text if does not have trigger', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              timestamp: '1632784639',
              type: 'interactive',
              interactive: {
                button_reply: {
                  id: 'send_reply_buttons',
                  title: 'Opção 2',
                },
                type: 'button_reply',
              },
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('text')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chat')
        expect(messages[0].trigger).toEqual(undefined)
        expect(messages[0].text).toEqual('send_reply_buttons')
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)
      })
    })

    describe('cart', () => {
      it('returns the response body transformed in messages and create new cart if contact has no cart opened', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const product = await Product.create(productFactory.build({ product_retailer_id: '1011', licensee }))

        const cartConcluded = await Cart.create(cartFactory.build({ contact, licensee, concluded: true }))

        const responseBody = {
          contacts: [{ profile: { name: 'John Doe' }, wa_id: '5511990283745' }],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhDXso22hmrDkcGXa_BDMaei',
              order: {
                catalog_id: '889635565073049',
                product_items: [
                  { currency: 'BRL', item_price: 25.8, product_retailer_id: '1011', quantity: 1 },
                  { currency: 'BRL', item_price: 5, product_retailer_id: '1016', quantity: 2 },
                ],
                text: 'Note',
              },
              timestamp: '1638368401',
              type: 'order',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        const cart = await Cart.findOne({ contact: contact._id, concluded: false })

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('cart')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhDXso22hmrDkcGXa_BDMaei')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chatbot')
        expect(messages[0].cart).not.toEqual(cartConcluded._id)
        expect(messages[0].cart._id).toEqual(cart._id)
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)

        expect(cart.delivery_tax).toEqual(0)
        expect(cart.catalog).toEqual('889635565073049')
        expect(cart.note).toEqual('Note')
        expect(cart.products.length).toEqual(2)
        expect(cart.products[0].unit_price).toEqual(25.8)
        expect(cart.products[0].quantity).toEqual(1)
        expect(cart.products[0].product_retailer_id).toEqual('1011')
        expect(cart.products[0].product).toEqual(product._id)
        expect(cart.products[1].unit_price).toEqual(5)
        expect(cart.products[1].quantity).toEqual(2)
        expect(cart.products[1].product_retailer_id).toEqual('1016')
        expect(cart.products[1].product).toEqual(null)
      })

      it('returns the response body transformed in messages and updates the cart if contact has cart opened', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            licensee,
          })
        )

        const cart = await Cart.create(cartFactory.build({ contact, licensee, concluded: false }))

        const responseBody = {
          contacts: [{ profile: { name: 'John Doe' }, wa_id: '5511990283745' }],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhDXso22hmrDkcGXa_BDMaei',
              order: {
                catalog_id: '889635565073049',
                product_items: [
                  { currency: 'BRL', item_price: 25.8, product_retailer_id: '1011', quantity: 1 },
                  { currency: 'BRL', item_price: 5, product_retailer_id: '1016', quantity: 2 },
                ],
                text: 'Note',
              },
              timestamp: '1638368401',
              type: 'order',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].licensee).toEqual(licensee._id)
        expect(messages[0].contact).toEqual(contact._id)
        expect(messages[0].kind).toEqual('cart')
        expect(messages[0].messageWaId).toEqual('ABEGVUiZKQggAhDXso22hmrDkcGXa_BDMaei')
        expect(messages[0].number).toEqual('150bdb15-4c55-42ac-bc6c-970d620fdb6d')
        expect(messages[0].destination).toEqual('to-chatbot')
        expect(messages[0].cart._id).toEqual(cart._id)
        expect(messages[0].text).toEqual(undefined)
        expect(messages[0].url).toEqual(undefined)
        expect(messages[0].fileName).toEqual(undefined)
        expect(messages[0].latitude).toEqual(undefined)
        expect(messages[0].longitude).toEqual(undefined)
        expect(messages[0].departament).toEqual(undefined)

        expect(messages.length).toEqual(1)

        const cartUpdated = await Cart.findOne({ contact: contact._id, concluded: false })

        expect(cartUpdated._id).toEqual(cart._id)
        expect(cartUpdated.delivery_tax).toEqual(0)
        expect(cartUpdated.catalog).toEqual('889635565073049')
        expect(cartUpdated.note).toEqual('Note')
        expect(cartUpdated.products.length).toEqual(2)
        expect(cartUpdated.products[0].unit_price).toEqual(25.8)
        expect(cartUpdated.products[0].quantity).toEqual(1)
        expect(cartUpdated.products[0].product_retailer_id).toEqual('1011')
        expect(cartUpdated.products[1].unit_price).toEqual(5)
        expect(cartUpdated.products[1].quantity).toEqual(2)
        expect(cartUpdated.products[1].product_retailer_id).toEqual('1016')
      })
    })

    it('updates the contact if contact exists and name is different', async () => {
      await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          licensee,
        })
      )

      const responseBody = {
        contacts: [
          {
            profile: {
              name: 'Jonny Cash',
            },
            wa_id: '5511990283745',
          },
        ],
        messages: [
          {
            from: '5511990283745',
            id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
            text: {
              body: 'Message',
            },
            timestamp: '1632784639',
            type: 'text',
          },
        ],
      }

      const dialog = new Dialog(licensee)
      await dialog.responseToMessages(responseBody)

      const contactUpdated = await Contact.findOne({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.name).toEqual('Jonny Cash')
    })

    it('updates the contact if contact exists and waId is different', async () => {
      await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          licensee,
        })
      )

      const responseBody = {
        contacts: [
          {
            profile: {
              name: 'Jonny Cash',
            },
            wa_id: '5511990283745',
          },
        ],
        messages: [
          {
            from: '5511990283745',
            id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
            text: {
              body: 'Message',
            },
            timestamp: '1632784639',
            type: 'text',
          },
        ],
      }

      const dialog = new Dialog(licensee)
      await dialog.responseToMessages(responseBody)

      const contactUpdated = await Contact.findOne({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.waId).toEqual('5511990283745')
    })

    it('does not update the contact if name is undefined', async () => {
      await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          waId: '5511990283745',
          licensee,
        })
      )

      const responseBody = {
        contacts: [
          {
            profile: {},
            wa_id: '5511990283745',
          },
        ],
        messages: [
          {
            from: '5511990283745',
            id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
            text: {
              body: 'Message',
            },
            timestamp: '1632784639',
            type: 'text',
          },
        ],
      }

      const dialog = new Dialog(licensee)
      await dialog.responseToMessages(responseBody)

      const contactUpdated = await Contact.findOne({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.name).toEqual('John Doe')
    })

    it('does not update the contact if wa_id is undefined', async () => {
      await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          waId: '5511990283745',
          licensee,
        })
      )

      const responseBody = {
        contacts: [
          {
            profile: {
              name: 'John Doe',
            },
          },
        ],
        messages: [
          {
            from: '5511990283745',
            id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
            text: {
              body: 'Message',
            },
            timestamp: '1632784639',
            type: 'text',
          },
        ],
      }

      const dialog = new Dialog(licensee)
      await dialog.responseToMessages(responseBody)

      const contactUpdated = await Contact.findOne({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.waId).toEqual('5511990283745')
    })

    it('updates the contact whatsapp start chat if field not filled', async () => {
      await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          waId: '5511990283745',
          licensee,
          wa_start_chat: null,
        })
      )

      const responseBody = {
        contacts: [
          {
            profile: {},
            wa_id: '5511990283745',
          },
        ],
        messages: [
          {
            from: '5511990283745',
            id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
            text: {
              body: 'Message',
            },
            timestamp: '1632784639',
            type: 'text',
          },
        ],
      }

      const dialog = new Dialog(licensee)
      await dialog.responseToMessages(responseBody)

      const contactUpdated = await Contact.findOne({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.wa_start_chat).not.toEqual(null)
    })

    it('does not update the contact whatsapp start chat if field already filled', async () => {
      await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          talkingWithChatBot: false,
          waId: '5511990283745',
          licensee,
          wa_start_chat: new Date('2023-04-15T12:36:10.018Z'),
        })
      )

      const responseBody = {
        contacts: [
          {
            profile: {
              name: 'John Doe',
            },
          },
        ],
        messages: [
          {
            from: '5511990283745',
            id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
            text: {
              body: 'Message',
            },
            timestamp: '1632784639',
            type: 'text',
          },
        ],
      }

      const dialog = new Dialog(licensee)
      await dialog.responseToMessages(responseBody)

      const contactUpdated = await Contact.findOne({
        number: '5511990283745',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.wa_start_chat).toEqual(new Date('2023-04-15T12:36:10.018Z'))
    })

    describe('when the contact does not exists', () => {
      it('registers the contact and return the response body transformed in messages', async () => {
        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5593165392999',
            },
          ],
          messages: [
            {
              from: '5593165392999',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
              text: {
                body: 'Message',
              },
              timestamp: '1632784639',
              type: 'text',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        const contact = await Contact.findOne({
          number: '5593165392999',
          type: '@c.us',
          licensee: licensee._id,
        })

        expect(contact.name).toEqual('John Doe')
        expect(contact.number).toEqual('5593165392999')
        expect(contact.type).toEqual('@c.us')
        expect(contact.waId).toEqual('5593165392999')
        expect(contact.talkingWithChatBot).toEqual(licensee.useChatbot)
        expect(contact.licensee).toEqual(licensee._id)
        expect(contact.wa_start_chat).not.toEqual(null)

        expect(messages.length).toEqual(1)
      })
    })

    describe('when the contact talking with chatbot', () => {
      it('returns the response body transformed in message with destination "to_chatbot"', async () => {
        await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            licensee,
            waId: '5511990283745',
          })
        )

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5511990283745',
            },
          ],
          messages: [
            {
              from: '5511990283745',
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
              text: {
                body: 'Message',
              },
              timestamp: '1632784639',
              type: 'text',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages[0]).toBeInstanceOf(Message)
        expect(messages[0].destination).toEqual('to-chatbot')

        expect(messages.length).toEqual(1)
      })
    })

    it('return the empty data if body is blank', async () => {
      const responseBody = {}

      const dialog = new Dialog(licensee)
      const messages = await dialog.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty data if body does not have messages', async () => {
      const responseBody = {
        instanceId: '244959',
      }

      const dialog = new Dialog(licensee)
      const messages = await dialog.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty data if message kind is sticker', async () => {
      const responseBody = {
        contacts: [
          {
            profile: {
              name: 'John Doe',
            },
            wa_id: '5511990283745',
          },
        ],
        messages: [
          {
            from: '5511990283745',
            id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC',
            sticker: {
              id: '52ab76ae-219d-4ed4-9514-dbe949351491',
              mime_type: 'image/webp',
              sha256: '95f7ae53f5306f4c7e92b1d866d9acf80f2b9b790b8854275fa9778ed6a03f6b',
            },
            timestamp: '1632784639',
            type: 'sticker',
          },
        ],
      }

      const dialog = new Dialog(licensee)
      const messages = await dialog.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    describe('when the body has statuses', () => {
      it('fills the message sendedAt if status is sent', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: false,
            waId: '5593165392997',
            licensee,
          })
        )

        await Message.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
            messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
          })
        )

        const responseBody = {
          statuses: [
            {
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
              status: 'sent',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages).toEqual([])

        const messageEdited = Message.findOne({
          licensee: licensee,
          messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
        })

        expect(messageEdited.sendedAt).not.toEqual(null)
      })

      it('fills the message deliveredAt if status is delivered', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            waId: '5593165392997',
            licensee,
          })
        )

        await Message.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
            messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
          })
        )

        const responseBody = {
          statuses: [
            {
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
              status: 'delivered',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages).toEqual([])

        const messageEdited = Message.findOne({
          licensee: licensee,
          messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
        })

        expect(messageEdited.deliveredAt).not.toEqual(null)
      })

      it('fills the message readAt if status is read', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            waId: '5593165392997',
            licensee,
          })
        )

        await Message.create(
          messageFactory.build({
            text: 'Message to send',
            contact,
            licensee,
            sended: false,
            messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
          })
        )

        const responseBody = {
          statuses: [
            {
              id: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
              status: 'read',
            },
          ],
        }

        const dialog = new Dialog(licensee)
        const messages = await dialog.responseToMessages(responseBody)

        expect(messages).toEqual([])

        const messageEdited = Message.findOne({
          licensee: licensee,
          messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
        })

        expect(messageEdited.readAt).not.toEqual(null)
      })
    })
  })

  describe('#sendMessage', () => {
    describe('when the message was sent', () => {
      it('marks the message with was sent and logs the success message', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            waId: '553165392832',
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

        const expectedBodySendMessage = {
          recipient_type: 'individual',
          to: '553165392832',
          type: 'text',
          text: {
            body: 'Message to send',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://waba.360dialog.io/v1/messages/' &&
              body === JSON.stringify(expectedBodySendMessage) &&
              headers['D360-API-KEY'] === 'token-dialog'
            )
          },
          {
            status: 201,
            body: {
              messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
              meta: { api_status: 'stable', version: '2.35.4' },
            },
          }
        )

        expect(message.sended).toEqual(false)

        const dialog = new Dialog(licensee)
        await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        const messageUpdated = await Message.findById(message._id)
        expect(messageUpdated.sended).toEqual(true)
        expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
        )
      })

      describe('when the message is image', () => {
        it('marks the message with sended and log the success message', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              _id: '60958703f415ed4008748637',
              text: 'Message to send',
              kind: 'file',
              url: 'https://octodex.github.com/images/dojocat.jpg',
              fileName: 'dojocat.jpg',
              contact,
              licensee,
              sended: false,
              messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
            })
          )

          fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
            status: 200,
            body: {
              contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
              meta: { api_status: 'stable', version: '2.35.4' },
            },
          })

          const expectedBodySendMessage = {
            recipient_type: 'individual',
            to: '553165392832',
            type: 'image',
            image: {
              link: 'https://octodex.github.com/images/dojocat.jpg',
            },
          }

          fetchMock.postOnce(
            (url, { body, headers }) => {
              return (
                url === 'https://waba.360dialog.io/v1/messages/' &&
                body === JSON.stringify(expectedBodySendMessage) &&
                headers['D360-API-KEY'] === 'token-dialog'
              )
            },
            {
              status: 201,
              body: {
                messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const dialog = new Dialog(licensee)
          await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
          expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
          expect(consoleInfoSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
          )
        })
      })

      describe('when the message is video', () => {
        it('marks the message with sended and log the success message', async () => {
          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              _id: '60958703f415ed4008748637',
              text: 'Message to send',
              kind: 'file',
              url: 'https://octodex.github.com/images/video.mpg',
              fileName: 'dojocat.jpg',
              contact,
              licensee,
              sended: false,
              messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
            })
          )

          fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
            status: 200,
            body: {
              contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
              meta: { api_status: 'stable', version: '2.35.4' },
            },
          })

          const expectedBodySendMessage = {
            recipient_type: 'individual',
            to: '553165392832',
            type: 'video',
            video: {
              link: 'https://octodex.github.com/images/video.mpg',
            },
          }

          fetchMock.postOnce(
            (url, { body, headers }) => {
              return (
                url === 'https://waba.360dialog.io/v1/messages/' &&
                body === JSON.stringify(expectedBodySendMessage) &&
                headers['D360-API-KEY'] === 'token-dialog'
              )
            },
            {
              status: 201,
              body: {
                messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const dialog = new Dialog(licensee)
          await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
          expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
          expect(consoleInfoSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
          )
        })
      })

      describe('when the message is audio', () => {
        it('marks the message with sended and log the success message', async () => {
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
              kind: 'file',
              url: 'https://octodex.github.com/images/message.ogg',
              fileName: 'message.ogg',
              contact,
              licensee,
              sended: false,
              messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
            })
          )

          fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
            status: 200,
            body: {
              contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
              meta: { api_status: 'stable', version: '2.35.4' },
            },
          })

          const expectedBodySendMessage = {
            recipient_type: 'individual',
            to: '553165392832',
            type: 'audio',
            audio: {
              link: 'https://octodex.github.com/images/message.ogg',
            },
          }

          fetchMock.postOnce(
            (url, { body, headers }) => {
              return (
                url === 'https://waba.360dialog.io/v1/messages/' &&
                body === JSON.stringify(expectedBodySendMessage) &&
                headers['D360-API-KEY'] === 'token-dialog'
              )
            },
            {
              status: 201,
              body: {
                messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const dialog = new Dialog(licensee)
          await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
          expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
          expect(consoleInfoSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
          )
        })
      })

      describe('when the message is document', () => {
        it('marks the message with sended and log the success message', async () => {
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
              kind: 'file',
              url: 'https://octodex.github.com/images/document.pdf',
              fileName: 'document.pdf',
            })
          )

          fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
            status: 200,
            body: {
              contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
              meta: { api_status: 'stable', version: '2.35.4' },
            },
          })

          const expectedBodySendMessage = {
            recipient_type: 'individual',
            to: '553165392832',
            type: 'document',
            document: {
              link: 'https://octodex.github.com/images/document.pdf',
              filename: 'document.pdf',
            },
          }

          fetchMock.postOnce(
            (url, { body, headers }) => {
              return (
                url === 'https://waba.360dialog.io/v1/messages/' &&
                body === JSON.stringify(expectedBodySendMessage) &&
                headers['D360-API-KEY'] === 'token-dialog'
              )
            },
            {
              status: 201,
              body: {
                messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const dialog = new Dialog(licensee)
          await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
          expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
          expect(consoleInfoSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
          )
        })
      })

      describe('when the message is interactive', () => {
        describe('if triggerKind is multi_product', () => {
          it('marks the message with sended and log the success message', async () => {
            const contact = await Contact.create(
              contactFactory.build({
                name: 'John Doe',
                talkingWithChatBot: true,
                email: 'john@doe.com',
                licensee,
              })
            )

            const trigger = await Trigger.create({
              ...triggerMultiProductFactory.build({ licensee }),
              catalogMulti: JSON.stringify({
                type: 'product_list',
                header: {
                  type: 'text',
                  text: 'Menu',
                },
                body: {
                  text: 'Itens',
                },
                footer: {
                  text: 'Selecione os itens desejados',
                },
                action: {
                  catalog_id: '889635565073049',
                  sections: [
                    {
                      title: 'Pizza',
                      product_items: [
                        {
                          product_retailer_id: '1010',
                        },
                        {
                          product_retailer_id: '1011',
                        },
                        {
                          product_retailer_id: '1021',
                        },
                      ],
                    },
                    {
                      title: 'Refrigerante',
                      product_items: [
                        {
                          product_retailer_id: '1016',
                        },
                      ],
                    },
                  ],
                },
              }),
            })

            const message = await Message.create(
              messageFactory.build({
                _id: '60958703f415ed4008748637',
                contact,
                licensee,
                sended: false,
                kind: 'interactive',
                trigger: trigger._id,
              })
            )

            fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
              status: 200,
              body: {
                contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            })

            const expectedBodySendMessage = {
              recipient_type: 'individual',
              to: '553165392832',
              type: 'interactive',
              interactive: {
                type: 'product_list',
                header: {
                  type: 'text',
                  text: 'Menu',
                },
                body: {
                  text: 'Itens',
                },
                footer: {
                  text: 'Selecione os itens desejados',
                },
                action: {
                  catalog_id: '889635565073049',
                  sections: [
                    {
                      title: 'Pizza',
                      product_items: [
                        {
                          product_retailer_id: '1010',
                        },
                        {
                          product_retailer_id: '1011',
                        },
                        {
                          product_retailer_id: '1021',
                        },
                      ],
                    },
                    {
                      title: 'Refrigerante',
                      product_items: [
                        {
                          product_retailer_id: '1016',
                        },
                      ],
                    },
                  ],
                },
              },
            }

            fetchMock.postOnce(
              (url, { body, headers }) => {
                return (
                  url === 'https://waba.360dialog.io/v1/messages/' &&
                  body === JSON.stringify(expectedBodySendMessage) &&
                  headers['D360-API-KEY'] === 'token-dialog'
                )
              },
              {
                status: 201,
                body: {
                  messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                  meta: { api_status: 'stable', version: '2.35.4' },
                },
              }
            )

            expect(message.sended).toEqual(false)

            const dialog = new Dialog(licensee)
            await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(2)

            const messageUpdated = await Message.findById(message._id)
            expect(messageUpdated.sended).toEqual(true)
            expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
            expect(consoleInfoSpy).toHaveBeenCalledWith(
              'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
            )
          })
        })

        describe('if triggerKind is single_product', () => {
          it('marks the message with sended and log the success message', async () => {
            const contact = await Contact.create(
              contactFactory.build({
                name: 'John Doe',
                talkingWithChatBot: true,
                email: 'john@doe.com',
                licensee,
              })
            )

            const trigger = await Trigger.create({
              ...triggerSingleProductFactory.build({ licensee }),
              catalogSingle: JSON.stringify({
                recipient_type: 'individual',
                to: '554899290820',
                type: 'interactive',
                interactive: {
                  type: 'product',
                  body: {
                    text: 'text-body-content',
                  },
                  footer: {
                    text: 'text-footer-content',
                  },
                  action: {
                    catalog_id: '889635565073049',
                    product_retailer_id: '1010',
                  },
                },
              }),
            })

            const message = await Message.create(
              messageFactory.build({
                _id: '60958703f415ed4008748637',
                contact,
                licensee,
                sended: false,
                kind: 'interactive',
                trigger: trigger._id,
              })
            )

            fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
              status: 200,
              body: {
                contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            })

            const expectedBodySendMessage = {
              recipient_type: 'individual',
              to: '553165392832',
              type: 'interactive',
              interactive: {
                recipient_type: 'individual',
                to: '554899290820',
                type: 'interactive',
                interactive: {
                  type: 'product',
                  body: {
                    text: 'text-body-content',
                  },
                  footer: {
                    text: 'text-footer-content',
                  },
                  action: {
                    catalog_id: '889635565073049',
                    product_retailer_id: '1010',
                  },
                },
              },
            }

            fetchMock.postOnce(
              (url, { body, headers }) => {
                return (
                  url === 'https://waba.360dialog.io/v1/messages/' &&
                  body === JSON.stringify(expectedBodySendMessage) &&
                  headers['D360-API-KEY'] === 'token-dialog'
                )
              },
              {
                status: 201,
                body: {
                  messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                  meta: { api_status: 'stable', version: '2.35.4' },
                },
              }
            )

            expect(message.sended).toEqual(false)

            const dialog = new Dialog(licensee)
            await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(2)

            const messageUpdated = await Message.findById(message._id)
            expect(messageUpdated.sended).toEqual(true)
            expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
            expect(consoleInfoSpy).toHaveBeenCalledWith(
              'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
            )
          })
        })

        describe('if triggerKind is reply_button', () => {
          it('marks the message with sended and log the success message', async () => {
            const contact = await Contact.create(
              contactFactory.build({
                name: 'John Doe',
                talkingWithChatBot: true,
                email: 'john@doe.com',
                licensee,
              })
            )

            const trigger = await Trigger.create({
              ...triggerReplyButtonFactory.build({ licensee }),
              textReplyButton: JSON.stringify({
                type: 'button',
                header: {
                  type: 'text',
                  text: 'Menu',
                },
                body: {
                  text: 'Itens',
                },
                footer: {
                  text: 'Selecione os itens desejados',
                },
                action: {
                  buttons: [
                    {
                      type: 'reply',
                      reply: {
                        id: 'resposta 1',
                        title: 'First Button Title',
                      },
                    },
                    {
                      type: 'reply',
                      reply: {
                        id: 'resposta 2',
                        title: 'Second Button Title',
                      },
                    },
                    {
                      type: 'reply',
                      reply: {
                        id: 'resposta 3',
                        title: 'Third Button Title',
                      },
                    },
                  ],
                },
              }),
            })

            const message = await Message.create(
              messageFactory.build({
                _id: '60958703f415ed4008748637',
                contact,
                licensee,
                sended: false,
                kind: 'interactive',
                trigger: trigger._id,
              })
            )

            fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
              status: 200,
              body: {
                contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            })

            const expectedBodySendMessage = {
              recipient_type: 'individual',
              to: '553165392832',
              type: 'interactive',
              interactive: {
                type: 'button',
                header: {
                  type: 'text',
                  text: 'Menu',
                },
                body: {
                  text: 'Itens',
                },
                footer: {
                  text: 'Selecione os itens desejados',
                },
                action: {
                  buttons: [
                    {
                      type: 'reply',
                      reply: {
                        id: 'resposta 1',
                        title: 'First Button Title',
                      },
                    },
                    {
                      type: 'reply',
                      reply: {
                        id: 'resposta 2',
                        title: 'Second Button Title',
                      },
                    },
                    {
                      type: 'reply',
                      reply: {
                        id: 'resposta 3',
                        title: 'Third Button Title',
                      },
                    },
                  ],
                },
              },
            }

            fetchMock.postOnce(
              (url, { body, headers }) => {
                return (
                  url === 'https://waba.360dialog.io/v1/messages/' &&
                  body === JSON.stringify(expectedBodySendMessage) &&
                  headers['D360-API-KEY'] === 'token-dialog'
                )
              },
              {
                status: 201,
                body: {
                  messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                  meta: { api_status: 'stable', version: '2.35.4' },
                },
              }
            )

            expect(message.sended).toEqual(false)

            const dialog = new Dialog(licensee)
            await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(2)

            const messageUpdated = await Message.findById(message._id)
            expect(messageUpdated.sended).toEqual(true)
            expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
            expect(consoleInfoSpy).toHaveBeenCalledWith(
              'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
            )
          })
        })

        describe('if triggerKind is list_message', () => {
          it('marks the message with sended and log the success message', async () => {
            const contact = await Contact.create(
              contactFactory.build({
                name: 'John Doe',
                talkingWithChatBot: true,
                email: 'john@doe.com',
                licensee,
              })
            )

            const trigger = await Trigger.create({
              ...triggerListMessageFactory.build({ licensee }),
              messagesList: JSON.stringify({
                type: 'list',
                header: {
                  type: 'text',
                  text: 'Menu',
                },
                body: {
                  text: 'Itens',
                },
                footer: {
                  text: 'Selecione os itens desejados',
                },
                action: {
                  button: 'cta-button-content',
                  sections: [
                    {
                      title: 'Opções',
                      rows: [
                        {
                          id: '1',
                          title: 'Opção 1',
                          description: 'Descrição 1',
                        },
                        {
                          id: '2',
                          title: 'Opção 2',
                          description: 'Descrição 2',
                        },
                        {
                          id: '3',
                          title: 'Opção 3',
                          description: 'Descrição 3',
                        },
                        {
                          id: '4',
                          title: 'Opção 4',
                          description: 'Descrição 4',
                        },
                      ],
                    },
                  ],
                },
              }),
            })

            const message = await Message.create(
              messageFactory.build({
                _id: '60958703f415ed4008748637',
                contact,
                licensee,
                sended: false,
                kind: 'interactive',
                trigger: trigger._id,
              })
            )

            fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
              status: 200,
              body: {
                contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            })

            const expectedBodySendMessage = {
              recipient_type: 'individual',
              to: '553165392832',
              type: 'interactive',
              interactive: {
                type: 'list',
                header: {
                  type: 'text',
                  text: 'Menu',
                },
                body: {
                  text: 'Itens',
                },
                footer: {
                  text: 'Selecione os itens desejados',
                },
                action: {
                  button: 'cta-button-content',
                  sections: [
                    {
                      title: 'Opções',
                      rows: [
                        {
                          id: '1',
                          title: 'Opção 1',
                          description: 'Descrição 1',
                        },
                        {
                          id: '2',
                          title: 'Opção 2',
                          description: 'Descrição 2',
                        },
                        {
                          id: '3',
                          title: 'Opção 3',
                          description: 'Descrição 3',
                        },
                        {
                          id: '4',
                          title: 'Opção 4',
                          description: 'Descrição 4',
                        },
                      ],
                    },
                  ],
                },
              },
            }

            fetchMock.postOnce(
              (url, { body, headers }) => {
                return (
                  url === 'https://waba.360dialog.io/v1/messages/' &&
                  body === JSON.stringify(expectedBodySendMessage) &&
                  headers['D360-API-KEY'] === 'token-dialog'
                )
              },
              {
                status: 201,
                body: {
                  messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                  meta: { api_status: 'stable', version: '2.35.4' },
                },
              }
            )

            expect(message.sended).toEqual(false)

            const dialog = new Dialog(licensee)
            await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(2)

            const messageUpdated = await Message.findById(message._id)
            expect(messageUpdated.sended).toEqual(true)
            expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
            expect(consoleInfoSpy).toHaveBeenCalledWith(
              'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
            )
          })
        })

        describe('if triggerKind is text', () => {
          it('marks the message with sended and log the success message', async () => {
            const contact = await Contact.create(
              contactFactory.build({
                name: 'John Doe',
                talkingWithChatBot: true,
                email: 'john@doe.com',
                licensee,
              })
            )

            const trigger = await Trigger.create({
              ...triggerTextFactory.build({ licensee }),
              text: 'Message normal with $contact_name',
            })

            const message = await Message.create(
              messageFactory.build({
                _id: '60958703f415ed4008748637',
                contact,
                licensee,
                sended: false,
                kind: 'interactive',
                trigger: trigger._id,
              })
            )

            fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
              status: 200,
              body: {
                contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            })

            const expectedBodySendMessage = {
              recipient_type: 'individual',
              to: '553165392832',
              type: 'text',
              text: {
                body: 'Message normal with John Doe',
              },
            }

            fetchMock.postOnce(
              (url, { body }) => {
                return (
                  url === 'https://waba.360dialog.io/v1/messages/' && body === JSON.stringify(expectedBodySendMessage)
                )
              },
              {
                status: 201,
                body: {
                  messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                  meta: { api_status: 'stable', version: '2.35.4' },
                },
              }
            )

            expect(message.sended).toEqual(false)

            const dialog = new Dialog(licensee)
            await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(2)

            const messageUpdated = await Message.findById(message._id)
            expect(messageUpdated.sended).toEqual(true)
            expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
            expect(consoleInfoSpy).toHaveBeenCalledWith(
              'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
            )
          })
        })

        describe('if does not has a trigger', () => {
          it('send the message as text', async () => {
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
                text: 'Hello World',
                contact,
                licensee,
                sended: false,
                kind: 'interactive',
              })
            )

            const expectedBodyGetContact = {
              blocking: 'wait',
              contacts: ['+5511990283745'],
              force_check: true,
            }

            fetchMock.postOnce(
              (url, { body }) => {
                return (
                  url === 'https://waba.360dialog.io/v1/contacts/' && body === JSON.stringify(expectedBodyGetContact)
                )
              },
              {
                status: 200,
                body: {
                  contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
                  meta: { api_status: 'stable', version: '2.35.4' },
                },
              }
            )

            const expectedBodySendMessage = {
              recipient_type: 'individual',
              to: '553165392832',
              type: 'text',
              text: {
                body: 'Hello World',
              },
            }

            fetchMock.postOnce(
              (url, { body }) => {
                return (
                  url === 'https://waba.360dialog.io/v1/messages/' && body === JSON.stringify(expectedBodySendMessage)
                )
              },
              {
                status: 201,
                body: {
                  messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                  meta: { api_status: 'stable', version: '2.35.4' },
                },
              }
            )

            expect(message.sended).toEqual(false)

            const dialog = new Dialog(licensee)
            await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
            await fetchMock.flush(true)

            expect(fetchMock.done()).toBe(true)
            expect(fetchMock.calls()).toHaveLength(2)

            const messageUpdated = await Message.findById(message._id)
            expect(messageUpdated.sended).toEqual(true)
            expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
            expect(consoleInfoSpy).toHaveBeenCalledWith(
              'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
            )
          })
        })
      })

      describe('when the message is cart', () => {
        it('marks the message with sended and log the success message', async () => {
          advanceTo(new Date('2021-01-05T10:25:47.000Z'))

          licensee.cartDefault = 'go2go'

          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const cart = await Cart.create(cartFactory.build({ contact, licensee }))

          const message = await Message.create(
            messageFactory.build({
              _id: '60958703f415ed4008748637',
              kind: 'cart',
              contact,
              licensee,
              cart,
              sended: false,
            })
          )

          fetchMock.postOnce(
            (url) => {
              return url === 'https://waba.360dialog.io/v1/contacts/'
            },
            {
              status: 200,
              body: {
                contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

          const expectedBodySendMessage = {
            recipient_type: 'individual',
            to: '553165392832',
            type: 'text',
            text: {
              body: '{"order":{"origemId":0,"deliveryMode":"MERCHANT","refPedido":"Ecommerce","refOrigem":"Ecommerce","refCurtaOrigem":"","docNotaFiscal":false,"valorDocNotaFiscal":"","nomeCliente":"John Doe","endEntrega":"","dataPedido":"2021-01-05T10:25:47.000Z","subTotal":17.8,"impostos":0,"voucher":0,"dataEntrega":"2021-01-05T10:25:47.000Z","taxaEntrega":0.5,"totalPedido":18.3,"documento":"","flagIntegrado":"NaoIntegrado","valorPagar":18.3,"telefonePedido":"5511990283745","pagamentos":[{"tipo":"","valor":18.3,"observacao":"","codigoResposta":"","bandeira":0,"troco":0,"nsu":0,"status":"NaoInformado","descontoId":0,"prePago":false,"transactionId":0}],"entrega":{"retiraLoja":false,"data":"","retirada":"Hoje","endereco":{"id":37025,"pais":"Brasil","padrao":false}},"itens":[{"produtoId":"0123","quantidade":2,"precoTotal":8.9,"adicionalPedidoItems":[{"produtoId":"Additional 1","atributoValorId":"Detail 1","quantidade":1,"precoTotal":0.5}]}]}}',
            },
          }

          fetchMock.postOnce(
            (url, { body }) => {
              return (
                url === 'https://waba.360dialog.io/v1/messages/' && body === JSON.stringify(expectedBodySendMessage)
              )
            },
            {
              status: 201,
              body: {
                messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const dialog = new Dialog(licensee)
          await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
          expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
          expect(consoleInfoSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
          )

          clear()
        })
      })

      describe('when the message is template', () => {
        it('marks the message with was sent and logs the success message', async () => {
          await Template.create(
            templateFactory.build({
              name: 'template-number-one',
              namespace: 'namespace',
              language: 'pt_BR',
              headerParams: [{ format: 'IMAGE' }],
              bodyParams: [
                { format: 'TEXT', number: '1' },
                { format: 'TEXT', number: '2' },
              ],
              footerParams: [{ format: 'TEXT', number: '1' }],
              licensee,
            })
          )

          const contact = await Contact.create(
            contactFactory.build({
              name: 'John Doe',
              talkingWithChatBot: true,
              licensee,
            })
          )

          const message = await Message.create(
            messageFactory.build({
              _id: '60958703f415ed4008748637',
              kind: 'template',
              text: 'name {{template-number-one}} image {{https://image.url/image.png}} text {{1}}-{{Produto x}} obrigado {{John Doe}}',
              contact,
              licensee,
              sended: false,
            })
          )

          fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
            status: 200,
            body: {
              contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
              meta: { api_status: 'stable', version: '2.35.4' },
            },
          })

          const expectedBodySendMessage = {
            recipient_type: 'individual',
            to: '553165392832',
            type: 'template',
            template: {
              namespace: 'namespace',
              name: 'template-number-one',
              language: {
                code: 'pt_BR',
                policy: 'deterministic',
              },
              components: [
                {
                  type: 'header',
                  parameters: [
                    {
                      type: 'image',
                      image: {
                        link: 'https://image.url/image.png',
                      },
                    },
                  ],
                },
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: '1',
                    },
                    {
                      type: 'text',
                      text: 'Produto x',
                    },
                  ],
                },
                {
                  type: 'footer',
                  parameters: [
                    {
                      type: 'text',
                      text: 'John Doe',
                    },
                  ],
                },
              ],
            },
          }

          fetchMock.postOnce(
            (url, { body, headers }) => {
              return (
                url === 'https://waba.360dialog.io/v1/messages/' &&
                body === JSON.stringify(expectedBodySendMessage) &&
                headers['D360-API-KEY'] === 'token-dialog'
              )
            },
            {
              status: 201,
              body: {
                messages: [{ id: 'gBEGVUiZKQggAgkTPoDDlOljYHY' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

          expect(message.sended).toEqual(false)

          const dialog = new Dialog(licensee)
          await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
          await fetchMock.flush(true)

          expect(fetchMock.done()).toBe(true)
          expect(fetchMock.calls()).toHaveLength(2)

          const messageUpdated = await Message.findById(message._id)
          expect(messageUpdated.sended).toEqual(true)
          expect(messageUpdated.messageWaId).toEqual('gBEGVUiZKQggAgkTPoDDlOljYHY')
          expect(consoleInfoSpy).toHaveBeenCalledWith(
            'Mensagem 60958703f415ed4008748637 enviada para Dialog360 com sucesso! {"messages":[{"id":"gBEGVUiZKQggAgkTPoDDlOljYHY"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
          )
        })
      })
    })

    describe('when contact is invalid', () => {
      it('logs the error message', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
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

        fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
          status: 200,
          body: {
            contacts: [{ input: '+5511990283745', status: 'invalid' }],
            meta: { api_status: 'stable', version: '2.35.4' },
          },
        })

        expect(message.sended).toEqual(false)

        const dialog = new Dialog(licensee)
        await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(1)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'A mensagem não foi enviada para a Dialog pois o contato não é válido {"contacts":[{"input":"+5511990283745","status":"invalid"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
        )
      })
    })

    describe('when can not send the message', () => {
      it('logs the error message', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
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

        fetchMock.postOnce('https://waba.360dialog.io/v1/contacts/', {
          status: 200,
          body: {
            contacts: [{ input: '+5511990283745', status: 'valid', wa_id: '553165392832' }],
            meta: { api_status: 'stable', version: '2.35.4' },
          },
        })

        const expectedBodySendMessage = {
          recipient_type: 'individual',
          to: '553165392832',
          type: 'text',
          text: {
            body: 'Message to send',
          },
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://waba.360dialog.io/v1/messages/' &&
              body === JSON.stringify(expectedBodySendMessage) &&
              headers['D360-API-KEY'] === 'token-dialog'
            )
          },
          {
            status: 400,
            body: {
              meta: { api_status: 'stable', version: '2.35.4' },
              errors: [{ code: 1021, title: 'Bad user', details: 'cannot send messages to myself' }],
            },
          }
        )

        expect(message.sended).toEqual(false)

        const dialog = new Dialog(licensee)
        await dialog.sendMessage(message._id, 'https://waba.360dialog.io/', 'token-dialog')
        await fetchMock.flush(true)

        expect(fetchMock.done()).toBe(true)
        expect(fetchMock.calls()).toHaveLength(2)

        const messageUpdated = await Message.findById(message._id)
        expect(messageUpdated.sended).toEqual(false)
        expect(messageUpdated.error).toEqual(
          '{"meta":{"api_status":"stable","version":"2.35.4"},"errors":[{"code":1021,"title":"Bad user","details":"cannot send messages to myself"}]}'
        )

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Mensagem 60958703f415ed4008748637 não enviada para Dialog360. {"meta":{"api_status":"stable","version":"2.35.4"},"errors":[{"code":1021,"title":"Bad user","details":"cannot send messages to myself"}]}'
        )
      })
    })
  })

  describe('#setWebhook', () => {
    it('config the webhook on dialog', async () => {
      const expectedBody = {
        url: `${licensee.urlWhatsappWebhook}`,
      }

      fetchMock.postOnce(
        (url, { body, headers }) => {
          return (
            url === 'https://waba.360dialog.io/v1/configs/webhook' &&
            body === JSON.stringify(expectedBody) &&
            headers['D360-API-KEY'] === 'token-dialog'
          )
        },
        {
          status: 200,
          body: {
            url: `${licensee.urlWhatsappWebhook}`,
          },
        }
      )

      const dialog = new Dialog(licensee)
      const setted = await dialog.setWebhook('https://waba.360dialog.io/', 'token-dialog')
      await fetchMock.flush(true)

      expect(fetchMock.done()).toBe(true)
      expect(fetchMock.calls()).toHaveLength(1)
      expect(setted).toEqual(true)
    })
  })

  describe('#searchTemplates', () => {
    it('returns the templates to licensee', async () => {
      fetchMock.getOnce(
        (url, { headers }) => {
          return url === 'https://waba.360dialog.io/v1/configs/templates' && headers['D360-API-KEY'] === 'token-dialog'
        },
        {
          status: 201,
          body: {
            count: 25,
            filters: {},
            limit: 1000,
            offset: 0,
            sort: ['id'],
            total: 25,
            waba_templates: [
              {
                category: 'TICKET_UPDATE',
                components: [
                  {
                    format: 'IMAGE',
                    type: 'HEADER',
                  },
                  {
                    text: 'Tiket Anda untuk *{{1}}*\n*Waktu* - {{2}}\n*Tempat* - {{3}}\n*Kursi* - {{4}}',
                    type: 'BODY',
                  },
                  {
                    text: 'Pesan ini berasal dari bisnis yang tidak terverifikasi.',
                    type: 'FOOTER',
                  },
                ],
                language: 'pt_BR',
                name: 'sample_movie_ticket_confirmation',
                namespace: '93aa6bf3_3bfc_4840_a76c_0f43073739e2',
                rejected_reason: 'NONE',
                status: 'approved',
              },
              {
                category: 'ISSUE_RESOLUTION',
                components: [
                  {
                    format: 'DOCUMENT',
                    type: 'HEADER',
                  },
                  {
                    text: 'Ini merupakan konfirmasi penerbangan Anda untuk {{1}}-{{2}} di {{3}}.',
                    type: 'BODY',
                  },
                  {
                    text: 'This message is from an unverified business.',
                    type: 'FOOTER',
                  },
                ],
                language: 'es',
                name: 'sample_purchase_feedback',
                namespace: '93aa6bf3_3bfc_4840_a76c_0f43073739e2',
                rejected_reason: 'NONE',
                status: 'approved',
              },
              {
                category: 'TICKET_UPDATE',
                components: [
                  {
                    text: 'Ini merupakan konfirmasi penerbangan Anda untuk {{1}}-{{2}}.',
                    type: 'BODY',
                  },
                  {
                    text: 'This message is from an unverified business.',
                    type: 'FOOTER',
                  },
                ],
                language: 'pt_BR',
                name: 'sample_purchase_feedback_2',
                namespace: '93aa6bf3_3bfc_4840_a76c_0f43073739e2',
                rejected_reason: 'Not aproval',
                status: 'rejected',
              },
            ],
          },
        }
      )

      const dialog = new Dialog(licensee)
      const templates = await dialog.searchTemplates('https://waba.360dialog.io/', 'token-dialog')
      await fetchMock.flush(true)

      expect(templates[0].name).toEqual('sample_movie_ticket_confirmation')
      expect(templates[0].namespace).toEqual('93aa6bf3_3bfc_4840_a76c_0f43073739e2')
      expect(templates[0].licensee).toEqual(licensee._id)
      expect(templates[0].language).toEqual('pt_BR')
      expect(templates[0].active).toEqual(true)
      expect(templates[0].category).toEqual('TICKET_UPDATE')
      expect(templates[0].headerParams[0].format).toEqual('IMAGE')
      expect(templates[0].bodyParams[0].format).toEqual('text')
      expect(templates[0].bodyParams[0].number).toEqual('1')
      expect(templates[0].bodyParams[1].format).toEqual('text')
      expect(templates[0].bodyParams[1].number).toEqual('2')
      expect(templates[0].bodyParams[2].format).toEqual('text')
      expect(templates[0].bodyParams[2].number).toEqual('3')
      expect(templates[0].bodyParams[3].format).toEqual('text')
      expect(templates[0].bodyParams[3].number).toEqual('4')
      expect(templates[0].footerParams.length).toEqual(0)

      expect(templates[1].name).toEqual('sample_purchase_feedback')
      expect(templates[1].namespace).toEqual('93aa6bf3_3bfc_4840_a76c_0f43073739e2')
      expect(templates[1].licensee).toEqual(licensee._id)
      expect(templates[1].language).toEqual('es')
      expect(templates[1].active).toEqual(true)
      expect(templates[1].category).toEqual('ISSUE_RESOLUTION')
      expect(templates[1].headerParams[0].format).toEqual('DOCUMENT')
      expect(templates[1].bodyParams[0].format).toEqual('text')
      expect(templates[1].bodyParams[0].number).toEqual('1')
      expect(templates[1].bodyParams[1].format).toEqual('text')
      expect(templates[1].bodyParams[1].number).toEqual('2')
      expect(templates[1].bodyParams[2].format).toEqual('text')
      expect(templates[1].bodyParams[2].number).toEqual('3')
      expect(templates[1].footerParams.length).toEqual(0)

      expect(templates[2].name).toEqual('sample_purchase_feedback_2')
      expect(templates[2].namespace).toEqual('93aa6bf3_3bfc_4840_a76c_0f43073739e2')
      expect(templates[2].licensee).toEqual(licensee._id)
      expect(templates[2].language).toEqual('pt_BR')
      expect(templates[2].active).toEqual(false)
      expect(templates[2].category).toEqual('TICKET_UPDATE')
      expect(templates[2].headerParams.length).toEqual(0)
      expect(templates[2].bodyParams[0].format).toEqual('text')
      expect(templates[2].bodyParams[0].number).toEqual('1')
      expect(templates[2].bodyParams[1].format).toEqual('text')
      expect(templates[2].bodyParams[1].number).toEqual('2')
      expect(templates[2].footerParams.length).toEqual(0)

      expect(templates.length).toEqual(3)
    })
  })

  describe('.action', () => {
    it('returns send-message-to-chat if message destination is to chat', () => {
      const dialog = new Dialog(licensee)

      expect(dialog.action('to-chat')).toEqual('send-message-to-chat')
    })

    it('returns send-message-to-chatbot if message destination is to chatbot', () => {
      const dialog = new Dialog(licensee)

      expect(dialog.action('to-chatbot')).toEqual('send-message-to-chatbot')
    })

    it('returns send-message-to-messenger if message destination is to messenger', () => {
      const dialog = new Dialog(licensee)

      expect(dialog.action('to-messenger')).toEqual('send-message-to-messenger')
    })
  })
})
