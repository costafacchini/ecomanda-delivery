const Dialog = require('./Dialog')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const Trigger = require('@models/Trigger')
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
} = require('@factories/trigger')

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

        expect(messages.length).toEqual(1)
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

        expect(messages.length).toEqual(1)
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
            waId: '5593165392997',
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

        const expectedBodyGetContact = {
          blocking: 'wait',
          contacts: ['+5511990283745'],
          force_check: true,
        }

        fetchMock.postOnce(
          (url, { body, headers }) => {
            return (
              url === 'https://waba.360dialog.io/v1/contacts/' &&
              body === JSON.stringify(expectedBodyGetContact) &&
              headers['D360-API-KEY'] === 'token-dialog'
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
        expect(fetchMock.calls()).toHaveLength(2)

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
              waId: '5593165392997',
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
              waId: '5593165392997',
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
              waId: '5593165392997',
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
              waId: '5593165392997',
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
                waId: '5593165392997',
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
                waId: '5593165392997',
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
                waId: '5593165392997',
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
                waId: '5593165392997',
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
      })
    })

    describe('when contact is invalid', () => {
      it('logs the error message', async () => {
        const contact = await Contact.create(
          contactFactory.build({
            name: 'John Doe',
            talkingWithChatBot: true,
            waId: '5593165392997',
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
            waId: '5593165392997',
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

  describe('.action', () => {
    it('returns send-message-to-chat if message destination is to chat', () => {
      const dialog = new Dialog(licensee)

      expect(dialog.action('to-chat')).toEqual('send-message-to-chat')
    })

    it('returns send-message-to-chatbot if message destination is to chatbot', () => {
      const dialog = new Dialog(licensee)

      expect(dialog.action('to-chatbot')).toEqual('send-message-to-chatbot')
    })
  })
})
