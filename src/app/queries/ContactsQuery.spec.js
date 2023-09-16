const ContactsQuery = require('@queries/ContactsQuery')
const mongoServer = require('../../../.jest/utils')
const Contact = require('@models/Contact')
const Licensee = require('@models/Licensee')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')

describe('ContactsQuery', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    licensee = await Licensee.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns all contacts ordered by createdAt asc', async () => {
    const contact1 = await Contact.create(contactFactory.build({ licensee, createdAt: new Date(2021, 6, 3, 0, 0, 0) }))
    const contact2 = await Contact.create(
      contactFactory.build({
        number: '551183847642',
        licensee,
        createdAt: new Date(2021, 6, 3, 0, 0, 1),
      }),
    )

    const contactsQuery = new ContactsQuery()
    const records = await contactsQuery.all()

    expect(records.length).toEqual(2)
    expect(records[0]).toEqual(expect.objectContaining({ _id: contact1._id }))
    expect(records[1]).toEqual(expect.objectContaining({ _id: contact2._id }))
  })

  describe('about pagination', () => {
    it('returns all by page respecting the limit', async () => {
      const contact1 = await Contact.create(
        contactFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )
      const contact2 = await Contact.create(
        contactFactory.build({
          number: '551183847642',
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )
      const contact3 = await Contact.create(
        contactFactory.build({
          number: '551164839723',
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 2),
        }),
      )

      const contactsQuery = new ContactsQuery()
      contactsQuery.page(1)
      contactsQuery.limit(2)

      let records = await contactsQuery.all()

      expect(records.length).toEqual(2)
      expect(records[0]).toEqual(expect.objectContaining({ _id: contact1._id }))
      expect(records[1]).toEqual(expect.objectContaining({ _id: contact2._id }))

      contactsQuery.page(2)
      records = await contactsQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: contact3._id }))

      contactsQuery.page(1)
      contactsQuery.limit(1)

      records = await contactsQuery.all()

      expect(records.length).toEqual(1)
      expect(records[0]).toEqual(expect.objectContaining({ _id: contact1._id }))
    })
  })

  describe('filterByType', () => {
    it('returns contacts filtered by type', async () => {
      const contact1 = await Contact.create(
        contactFactory.build({
          type: '@c.us',
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )
      const contact2 = await Contact.create(
        contactFactory.build({
          type: '@g.us',
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )

      const contactsQuery = new ContactsQuery()
      contactsQuery.filterByType('@c.us')
      const records = await contactsQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact2._id })]))
    })
  })

  describe('filterByTalkingWithChatbot', () => {
    it('returns contacts filtered by talking with chatbot', async () => {
      const contact1 = await Contact.create(
        contactFactory.build({
          number: '551190283745',
          talkingWithChatBot: false,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )
      const contact2 = await Contact.create(
        contactFactory.build({
          talkingWithChatBot: true,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )

      const contactsQuery = new ContactsQuery()
      contactsQuery.filterByTalkingWithChatbot(true)
      const records = await contactsQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact1._id })]))
    })
  })

  describe('filterByLicensee', () => {
    it('returns contacts filtered by licensee', async () => {
      const contact1 = await Contact.create(
        contactFactory.build({
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )

      const anotherLicensee = await Licensee.create(licenseeFactory.build({ name: 'Wolf e cia' }))
      const contact2 = await Contact.create(
        contactFactory.build({
          licensee: anotherLicensee._id,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )

      const contactsQuery = new ContactsQuery()
      contactsQuery.filterByLicensee(licensee._id)

      const records = await contactsQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact2._id })]))
    })
  })

  describe('filterByExpression', () => {
    it('returns licensees filtered by expression on name, email, number, waId and landbotId', async () => {
      const contact1 = await Contact.create(
        contactFactory.build({
          name: 'John Doe',
          email: 'john@nothing.com',
          waId: '1934',
          landbotId: '0987',
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 0),
        }),
      )
      const contact2 = await Contact.create(
        contactFactory.build({
          name: 'Mary Jane',
          email: 'mary@doe.com',
          number: '551183847642',
          waId: '5678',
          landbotId: '3456',
          talkingWithChatBot: true,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 1),
        }),
      )
      const contact3 = await Contact.create(
        contactFactory.build({
          name: 'Lizzy Black List',
          email: 'lizzy@blacklist.com',
          number: '551162839723',
          waId: '9012',
          landbotId: '3219',
          talkingWithChatBot: true,
          licensee,
          createdAt: new Date(2021, 6, 3, 0, 0, 2),
        }),
      )

      const contactsQuery = new ContactsQuery()
      contactsQuery.filterByExpression('Doe 12')
      let records = await contactsQuery.all()

      expect(records.length).toEqual(3)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact1._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact2._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact3._id })]))

      contactsQuery.filterByExpression('4')
      records = await contactsQuery.all()

      expect(records.length).toEqual(2)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact1._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact2._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact3._id })]))

      contactsQuery.filterByExpression('283')
      records = await contactsQuery.all()

      expect(records.length).toEqual(2)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact1._id })]))
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact2._id })]))

      contactsQuery.filterByExpression('219')
      records = await contactsQuery.all()

      expect(records.length).toEqual(1)
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact3._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact1._id })]))
      expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: contact2._id })]))
    })
  })
})
