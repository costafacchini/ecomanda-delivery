const Dialog = require('./Dialog')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const fetchMock = require('fetch-mock')
const mongoServer = require('../../../../.jest/utils')
const S3 = require('../storage/S3')

jest.mock('uuid', () => ({ v4: () => '150bdb15-4c55-42ac-bc6c-970d620fdb6d' }))

describe('Dialog plugin', () => {
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
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5593165392832',
            },
          ],
          messages: [
            {
              from: '5593165392832',
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
        const licensee = await Licensee.create({
          name: 'Alcateia Ltds',
          active: true,
          licenseKind: 'demo',
          whatsappToken: 'whats-token',
        })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5593165392832',
            },
          ],
          messages: [
            {
              from: '5593165392832',
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
        const licensee = await Licensee.create({
          name: 'Alcateia Ltds',
          active: true,
          licenseKind: 'demo',
          whatsappToken: 'whats-token',
        })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5593165392832',
            },
          ],
          messages: [
            {
              from: '5593165392832',
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
        const licensee = await Licensee.create({
          name: 'Alcateia Ltds',
          active: true,
          licenseKind: 'demo',
          whatsappToken: 'whats-token',
        })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5593165392832',
            },
          ],
          messages: [
            {
              from: '5593165392832',
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
        const licensee = await Licensee.create({
          name: 'Alcateia Ltds',
          active: true,
          licenseKind: 'demo',
          whatsappToken: 'whats-token',
        })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5593165392832',
            },
          ],
          messages: [
            {
              from: '5593165392832',
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
        const licensee = await Licensee.create({
          name: 'Alcateia Ltds',
          active: true,
          licenseKind: 'demo',
          whatsappToken: 'whats-token',
        })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392832@c.us',
          type: '@c.us',
          talkingWithChatBot: false,
          licensee: licensee,
        })

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5593165392832',
            },
          ],
          messages: [
            {
              from: '5593165392832',
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

    it('updates the contact if contact exists and name is different', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      const responseBody = {
        contacts: [
          {
            profile: {
              name: 'Jonny Cash',
            },
            wa_id: '5593165392832',
          },
        ],
        messages: [
          {
            from: '5593165392832',
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
        number: '5593165392832',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.name).toEqual('Jonny Cash')
    })

    it('updates the contact if contact exists and waId is different', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', waId: '123', active: true, licenseKind: 'demo' })

      await Contact.create({
        name: 'John Doe',
        number: '5593165392832@c.us',
        type: '@c.us',
        talkingWithChatBot: false,
        licensee: licensee,
      })

      const responseBody = {
        contacts: [
          {
            profile: {
              name: 'Jonny Cash',
            },
            wa_id: '5593165392832',
          },
        ],
        messages: [
          {
            from: '5593165392832',
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
        number: '5593165392832',
        type: '@c.us',
        licensee: licensee._id,
      })

      expect(contactUpdated.waId).toEqual('5593165392832')
    })

    describe('when the contact does not exists', () => {
      it('registers the contact and return the response body transformed in messages', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

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
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        await Contact.create({
          name: 'John Doe',
          number: '5593165392997@c.us',
          type: '@c.us',
          talkingWithChatBot: true,
          waId: '5593165392997',
          licensee: licensee,
        })

        const responseBody = {
          contacts: [
            {
              profile: {
                name: 'John Doe',
              },
              wa_id: '5593165392997',
            },
          ],
          messages: [
            {
              from: '5593165392997',
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
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {}

      const dialog = new Dialog(licensee)
      const messages = await dialog.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    it('return the empty data if body does not have messages', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

      const responseBody = {
        instanceId: '244959',
      }

      const dialog = new Dialog(licensee)
      const messages = await dialog.responseToMessages(responseBody)

      expect(messages.length).toEqual(0)
    })

    describe('when the body has statuses', () => {
      it('fills the message sendedAt if status is sent', async () => {
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392997@c.us',
          type: '@c.us',
          talkingWithChatBot: true,
          waId: '5593165392997',
          licensee: licensee,
        })

        await Message.create({
          text: 'Text',
          number: 'Abc012',
          contact: contact,
          licensee: licensee,
          destination: 'to-chat',
          messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
        })

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
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392997@c.us',
          type: '@c.us',
          talkingWithChatBot: true,
          waId: '5593165392997',
          licensee: licensee,
        })

        await Message.create({
          text: 'Text',
          number: 'Abc012',
          contact: contact,
          licensee: licensee,
          destination: 'to-chat',
          messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
        })

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
        const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })

        const contact = await Contact.create({
          name: 'John Doe',
          number: '5593165392997@c.us',
          type: '@c.us',
          talkingWithChatBot: true,
          waId: '5593165392997',
          licensee: licensee,
        })

        await Message.create({
          text: 'Text',
          number: 'Abc012',
          contact: contact,
          licensee: licensee,
          destination: 'to-chat',
          messageWaId: 'ABEGVUiZKQggAhB1b33BM5Tk-yMHllM09TlC44',
        })

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

        const expectedBodyGetContact = {
          blocking: 'wait',
          contacts: ['+5593165392832'],
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
              contacts: [{ input: '+5593165392832', status: 'valid', wa_id: '553165392832' }],
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

          const expectedBodyGetContact = {
            blocking: 'wait',
            contacts: ['+5593165392832'],
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
                contacts: [{ input: '+5593165392832', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

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
            url: 'https://octodex.github.com/images/video.mpg',
            fileName: 'dojocat.jpg',
            sended: false,
          })

          const expectedBodyGetContact = {
            blocking: 'wait',
            contacts: ['+5593165392832'],
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
                contacts: [{ input: '+5593165392832', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

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
            url: 'https://octodex.github.com/images/message.ogg',
            fileName: 'message.ogg',
            sended: false,
          })

          const expectedBodyGetContact = {
            blocking: 'wait',
            contacts: ['+5593165392832'],
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
                contacts: [{ input: '+5593165392832', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

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
            url: 'https://octodex.github.com/images/document.pdf',
            fileName: 'document.pdf',
            sended: false,
          })

          const expectedBodyGetContact = {
            blocking: 'wait',
            contacts: ['+5593165392832'],
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
                contacts: [{ input: '+5593165392832', status: 'valid', wa_id: '553165392832' }],
                meta: { api_status: 'stable', version: '2.35.4' },
              },
            }
          )

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
    })

    describe('when contact is invalid', () => {
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

        const expectedBodyGetContact = {
          blocking: 'wait',
          contacts: ['+5593165392832'],
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
              contacts: [{ input: '+5593165392832', status: 'invalid' }],
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

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'A mensagem não foi enviada para a Dialog pois o contato não é válido {"contacts":[{"input":"+5593165392832","status":"invalid"}],"meta":{"api_status":"stable","version":"2.35.4"}}'
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

        const expectedBodyGetContact = {
          blocking: 'wait',
          contacts: ['+5593165392832'],
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
              contacts: [{ input: '+5593165392832', status: 'valid', wa_id: '553165392832' }],
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

  describe('.action', () => {
    it('returns send-message-to-chat if message destination is to chat', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })
      const dialog = new Dialog(licensee)

      expect(dialog.action('to-chat')).toEqual('send-message-to-chat')
    })

    it('returns send-message-to-chatbot if message destination is to chatbot', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia Ltds', active: true, licenseKind: 'demo' })
      const dialog = new Dialog(licensee)

      expect(dialog.action('to-chatbot')).toEqual('send-message-to-chatbot')
    })
  })
})
