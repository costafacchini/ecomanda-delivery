const BillingQuery = require('@queries/BillingQuery')
const mongoServer = require('../../../.jest/utils')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')

describe('BillingQuery', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns the billed data for licensees', async () => {
    const licensee1 = await Licensee.create(licenseeFactory.build({ createdAt: new Date(2020, 1, 1, 0, 0, 0) }))
    const contact1 = await Contact.create(contactFactory.build({ licensee: licensee1 }))
    await Message.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: new Date(2021, 11, 30, 0, 0, 0),
      })
    )
    await Message.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: new Date(2021, 12, 1, 0, 0, 0),
      })
    )
    await Message.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: new Date(2021, 12, 31, 0, 0, 0),
      })
    )
    await Message.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: new Date(2022, 1, 1, 0, 0, 0),
      })
    )
    await Message.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: new Date(2022, 1, 31, 0, 0, 0),
      })
    )
    await Message.create(
      messageFactory.build({
        contact: contact1,
        licensee: licensee1,
        createdAt: new Date(2022, 2, 1, 0, 0, 0),
      })
    )

    const licensee2 = await Licensee.create(licenseeFactory.build({ createdAt: new Date(2022, 1, 1, 0, 0, 0) }))
    const contact2 = await Contact.create(contactFactory.build({ licensee: licensee2 }))
    await Message.create(
      messageFactory.build({
        contact: contact2,
        licensee: licensee2,
        createdAt: new Date(2022, 1, 1, 0, 0, 0),
      })
    )
    await Message.create(
      messageFactory.build({
        contact: contact2,
        licensee: licensee2,
        createdAt: new Date(2022, 1, 31, 0, 0, 0),
      })
    )

    const licensee3 = await Licensee.create(licenseeFactory.build({ createdAt: new Date(2019, 1, 1, 0, 0, 0) }))
    const contact3 = await Contact.create(contactFactory.build({ licensee: licensee2 }))
    await Message.create(
      messageFactory.build({
        contact: contact3,
        licensee: licensee3,
        createdAt: new Date(2019, 5, 1, 0, 0, 0),
      })
    )
    await Message.create(
      messageFactory.build({
        contact: contact3,
        licensee: licensee3,
        createdAt: new Date(2019, 12, 15, 0, 0, 0),
      })
    )

    const billingQuery = new BillingQuery(new Date(2022, 2, 10, 0, 0, 0))
    const records = await billingQuery.all()

    expect(records.length).toEqual(3)

    expect(records[0]).toEqual(
      expect.objectContaining({
        _id: licensee1._id,
        createdAt: licensee1.createdAt,
        firstMessageDate: '2021-12-01T00:00:00.000Z',
        lastMessageDate: '2022-01-15T00:00:00.000Z',
        billing: true,
        messages: [
          {
            month: 12,
            year: 2021,
            count: 2,
          },
          {
            month: 1,
            year: 2022,
            count: 2,
          },
        ],
      })
    )
    expect(records[1]).toEqual(
      expect.objectContaining({
        _id: licensee2._id,
        createdAt: licensee2.createdAt,
        firstMessageDate: '2022-01-01T00:00:00.000Z',
        lastMessageDate: '2022-01-17T00:00:00.000Z',
        billing: false,
        messages: [
          {
            month: 12,
            year: 2021,
            count: 0,
          },
          {
            month: 1,
            year: 2022,
            count: 2,
          },
        ],
      })
    )
    expect(records[2]).toEqual(
      expect.objectContaining({
        _id: licensee3._id,
        createdAt: licensee3.createdAt,
        firstMessageDate: '2019-05-01T00:00:00.000Z',
        lastMessageDate: '2019-12-15T00:00:00.000Z',
        billing: false,
        messages: [
          {
            month: 12,
            year: 2021,
            count: 0,
          },
          {
            month: 1,
            year: 2022,
            count: 0,
          },
        ],
      })
    )

    //  [
    //    {
    //      _id: 23434n78y286,
    //      creationDate: '2020-01-01T00:00:00.000Z',
    //      firstMessageDate: '2021-12-01T00:00:00.000Z',
    //      lastMessageDate: '2022-01-15T00:00:00.000Z',
    //      billing: true,
    //      messages: [
    //        {
    //          month: 12,
    //          year: 2021,
    //          count: 5,
    //        },
    //        {
    //          month: 1,
    //          year: 2022,
    //          count: 4,
    //        }
    //      ]
    //    },
    //    {
    //      _id: 2903462jvc234,
    //      creationDate: '2022--01T00:00:00.000Z',
    //      firstMessageDate: '2022-01-01T00:00:00.000Z',
    //      lastMessageDate: '2022-01-17T00:00:00.000Z',
    //      billing: false,
    //      messages: [
    //        {
    //          month: 12,
    //          year: 2021,
    //          count: 0,
    //        },
    //        {
    //          month: 1,
    //          year: 2022,
    //          count: 10,
    //        }
    //      ]
    //    },
    //    {
    //      _id: 2903462jvc234,
    //      creationDate: '2019-01-01T00:00:00.000Z',
    //      firstMessageDate: '2019-05-01T00:00:00.000Z',
    //      lastMessageDate: '2019-12-15T00:00:00.000Z',
    //      billing: false,
    //      messages: [
    //        {
    //          month: 12,
    //          year: 2021,
    //          count: 0,
    //        },
    //        {
    //          month: 1,
    //          year: 2022,
    //          count: 0,
    //        }
    //      ]
    //    }
    //  ]
    //
  })
})
