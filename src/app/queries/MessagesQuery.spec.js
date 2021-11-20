const MessagesQuery = require('@queries/MessagesQuery')
const mongoServer = require('../../../.jest/utils')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')

describe('MessagesQuery', () => {
  let licensee
  let contact

  beforeEach(async () => {
    await mongoServer.connect()

    licensee = await Licensee.create(licenseeFactory.build())
    contact = await Contact.create(contactFactory.build({ licensee }))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns all messages ordered by createdAt', async () => {
    const message1 = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      })
    )
    const message2 = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        createdAt: new Date(2021, 6, 3, 0, 0, 1),
      })
    )

    const messagesQuery = new MessagesQuery()
    const records = await messagesQuery.all()

    expect(records.length).toEqual(2)
    expect(records[0]).toEqual(expect.objectContaining({ _id: message2._id }))
    expect(records[1]).toEqual(expect.objectContaining({ _id: message1._id }))
  })

  describe('about pagination', () => {
    it('returns all by page respecting the limit', async () => {
      const message1 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        })
      )
      const message2 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )
      const message3 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 2),
        })
      )

      const messagesQuery = new MessagesQuery()
      messagesQuery.page(1)
      messagesQuery.limit(2)

      let records = await messagesQuery.all()

      expect(records.length).toEqual(2)
      expect(records[0]).toEqual(expect.objectContaining({ _id: message3._id }))
      expect(records[1]).toEqual(expect.objectContaining({ _id: message2._id }))

      messagesQuery.page(2)
      records = await messagesQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: message1._id }))

      messagesQuery.page(1)
      messagesQuery.limit(1)

      records = await messagesQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: message3._id }))
    })
  })

  describe('filterByCreatedAt', () => {
    it('returns messages filtered by createdAt', async () => {
      const message1 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )
      const message2 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 23, 59, 58),
        })
      )
      const messageBefore = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 2, 23, 59, 59),
        })
      )
      const messageAfter = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 4, 0, 0, 0),
        })
      )

      const messagesQuery = new MessagesQuery()
      messagesQuery.filterByCreatedAt(new Date(2021, 6, 3, 0, 0, 0), new Date(2021, 6, 3, 23, 59, 59))

      const records = await messagesQuery.all()

      expect(records.length).toEqual(2)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: message2._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: message1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: messageBefore._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: messageAfter._id })]))
    })
  })

  describe('filterByLicensee', () => {
    it('returns messages filtered by licensee', async () => {
      const message = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )

      const anotherLicensee = await Licensee.create(licenseeFactory.build())
      const anotherMessage = await Message.create(
        messageFactory.build({
          contact,
          licensee: anotherLicensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )

      const messagesQuery = new MessagesQuery()
      messagesQuery.filterByLicensee(licensee._id)

      const records = await messagesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: message._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: anotherMessage._id })]))
    })
  })

  describe('filterByContact', () => {
    it('returns messages filtered by licensee', async () => {
      const message = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )

      const anotherContact = await Contact.create(contactFactory.build({ licensee }))
      const anotherMessage = await Message.create(
        messageFactory.build({
          contact: anotherContact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )

      const messagesQuery = new MessagesQuery()
      messagesQuery.filterByContact(contact._id)

      const records = await messagesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: message._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: anotherMessage._id })]))
    })
  })

  describe('filterByKind', () => {
    it('returns messages filtered by kind', async () => {
      const message1 = await Message.create(
        messageFactory.build({
          kind: 'text',
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        })
      )
      const message2 = await Message.create(
        messageFactory.build({
          url: 'Message 2',
          fileName: 'Message 2',
          kind: 'file',
          contact,
          licensee,
          destination: 'to-chatbot',
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )

      const messagesQuery = new MessagesQuery()
      messagesQuery.filterByKind('file')
      const records = await messagesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: message2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: message1._id })]))
    })
  })

  describe('filterByDestination', () => {
    it('returns messages filtered by destination', async () => {
      const message1 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        })
      )
      const message2 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          destination: 'to-chatbot',
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )

      const messagesQuery = new MessagesQuery()
      messagesQuery.filterByDestination('to-chatbot')
      const records = await messagesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: message2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: message1._id })]))
    })
  })

  describe('filterBySended', () => {
    it('returns messages filtered by sended', async () => {
      const message1 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          sended: true,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        })
      )
      const message2 = await Message.create(
        messageFactory.build({
          contact,
          licensee,
          sended: false,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        })
      )

      const messagesQuery = new MessagesQuery()
      messagesQuery.filterBySended(true)
      const records = await messagesQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: message1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: message2._id })]))
    })
  })
})
