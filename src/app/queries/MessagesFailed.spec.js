const mongoServer = require('../../../.jest/utils')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const MessagesFailedQuery = require('./MessagesFailed')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('MessagesFailedQuery', () => {
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

  it('returns the messages that not sended filtered by licensee and period', async () => {
    const filteredMessageNotSended1 = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )
    const filteredMessageNotSended2 = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )
    const filteredMessageSended = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: true,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )
    const filteredMessageBefore = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 2, 23, 59, 59),
      }),
    )
    const filteredMessageAfter = await Message.create(
      messageFactory.build({
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 4, 0, 0, 0),
      }),
    )
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const anotherLicensee = await licenseeRepository.create(licenseeFactory.build())
    const messageSendedAnotherLicensee = await Message.create(
      messageFactory.build({
        contact,
        licensee: anotherLicensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 0, 0, 0),
      }),
    )
    const filteredMessageNotSendedChatEndedByAgent = await Message.create(
      messageFactory.build({
        text: 'Chat encerrado pelo agente',
        contact,
        licensee,
        sended: false,
        createdAt: new Date(2021, 6, 3, 23, 59, 58),
      }),
    )

    const messagesFailedQuery = new MessagesFailedQuery(
      new Date(2021, 6, 3, 0, 0, 0),
      new Date(2021, 6, 3, 23, 59, 59),
      licensee._id,
    )
    const records = await messagesFailedQuery.all()

    expect(records.length).toEqual(2)
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSended1._id })]))
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSended2._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSendedChatEndedByAgent._id })]),
    )
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageSended._id })]))
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageBefore._id })]))
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageAfter._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: messageSendedAnotherLicensee._id })]),
    )
  })
})
