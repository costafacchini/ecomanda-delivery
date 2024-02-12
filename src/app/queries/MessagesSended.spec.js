const mongoServer = require('../../../.jest/utils')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const MessagesSendedQuery = require('./MessagesSended')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('MessagesSendedQuery', () => {
  let licensee
  let contact

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
    contact = await Contact.create(contactFactory.build({ licensee }))
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns the messages that sended filtered by licensee and period', async () => {
    const filteredMessageSended1 = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )
    const filteredMessageSended2 = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )
    const filteredMessageNotSended = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )
    const filteredMessageBefore = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 2, 23, 59, 59),
      }),
    )
    const filteredMessageAfter = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 4, 0, 0, 0),
      }),
    )

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
    const messageSendedAnotherLicensee = await Message.create(
      messageFactory.build({
        contact,
        licensee: anotherLicensee,
        sended: true,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )

    const messagesSendedQuery = new MessagesSendedQuery(
      new Date(2021, 6, 3, 0, 0, 0),
      new Date(2021, 6, 3, 23, 59, 59),
      licensee._id,
    )
    const records = await messagesSendedQuery.all()

    expect(records.length).toEqual(2)
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageSended1._id })]))
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageSended2._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSended._id })]),
    )
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageBefore._id })]))
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageAfter._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: messageSendedAnotherLicensee._id })]),
    )
  })
})
