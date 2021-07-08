const mongoServer = require('../../../.jest/utils')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const MessagesFailedQuery = require('./MessagesFailed')

describe('MessagesFailedQuery', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })
  it('returns the messages that not sended filtered by licensee and period', async () => {
    const filteredLicensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
    const filteredContact = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: false,
      licensee: filteredLicensee._id,
    })
    const filteredMessageNotSended1 = await Message.create({
      text: 'Message 1',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: false,
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })
    const filteredMessageNotSended2 = await Message.create({
      text: 'Message 2',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: false,
      createdAt: new Date(2021, 6, 3, 23, 59, 58),
    })
    const filteredMessageSended = await Message.create({
      text: 'Message 3',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: true,
      createdAt: new Date(2021, 6, 3, 23, 59, 58),
    })
    const filteredMessageBefore = await Message.create({
      text: 'Message 4',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: false,
      createdAt: new Date(2021, 6, 2, 23, 59, 59),
    })
    const filteredMessageAfter = await Message.create({
      text: 'Message 5',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: false,
      createdAt: new Date(2021, 6, 4, 0, 0, 0),
    })
    const anotherLicensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
    const messageSendedAnotherLicensee = await Message.create({
      text: 'Message 6',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: anotherLicensee._id,
      destination: 'to-chat',
      sended: false,
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })
    const filteredMessageNotSendedChatEndedByAgent = await Message.create({
      text: 'Chat encerrado pelo agente',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: false,
      createdAt: new Date(2021, 6, 3, 23, 59, 58),
    })

    const messagesFailedQuery = new MessagesFailedQuery(
      new Date(2021, 6, 3, 0, 0, 0),
      new Date(2021, 6, 3, 23, 59, 59),
      filteredLicensee._id
    )
    const records = await messagesFailedQuery.all()

    expect(records.length).toEqual(2)
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSended1._id })]))
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSended2._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: filteredMessageNotSendedChatEndedByAgent._id })])
    )
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageSended._id })]))
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageBefore._id })]))
    expect(records).not.toEqual(expect.arrayContaining([expect.objectContaining({ _id: filteredMessageAfter._id })]))
    expect(records).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: messageSendedAnotherLicensee._id })])
    )
  })
})
