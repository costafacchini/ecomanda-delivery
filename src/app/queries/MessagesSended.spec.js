const mongoServer = require('../../../.jest/utils')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const MessagesSendedQuery = require('./MessagesSended')
const { ExpectationFailed } = require('http-errors')

describe('MessagesSendedQuery', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })
  it('returns the messages that sended filtered by licensee and period', async () => {
    const filteredLicensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
    const filteredContact = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: false,
      licensee: filteredLicensee._id,
      createdAt: new Date(2021, 7, 3, 0, 0, 0),
    })
    const filteredMessageSended1 = await Message.create({
      text: 'Message 1',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: true,
      createdAt: new Date(2021, 7, 3, 0, 0, 0),
    })
    const filteredMessageSended2 = await Message.create({
      text: 'Message 2',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: true,
      createdAt: new Date(2021, 7, 3, 23, 59, 59),
    })
    const filteredMessageNotSended = await Message.create({
      text: 'Message 3',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: false,
      createdAt: new Date(2021, 7, 3, 23, 59, 59),
    })
    const filteredMessageBefore = await Message.create({
      text: 'Message 3',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: true,
      createdAt: new Date(2021, 7, 2, 23, 59, 59),
    })
    const filteredMessageAfter = await Message.create({
      text: 'Message 3',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: filteredLicensee._id,
      destination: 'to-chat',
      sended: true,
      createdAt: new Date(2021, 7, 4, 0, 0, 0),
    })
    const anotherLicensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })
    const messageSendedAnotherLicensee = await Message.create({
      text: 'Message 1',
      number: filteredContact.number,
      contact: filteredContact._id,
      licensee: anotherLicensee._id,
      destination: 'to-chat',
      sended: true,
      createdAt: new Date(2021, 7, 3, 0, 0, 0),
    })

    const messagesSendedQuery = new MessagesSendedQuery(
      new Date(2021, 7, 3, 0, 0, 0),
      new Date(2021, 7, 3, 23, 59, 59),
      filteredLicensee._id
    )
    const records = await messagesSendedQuery.all()

    console.log(records)
    expect(records.length).toEqual(2)
  })
})
