const mongoServer = require('../../../.jest/utils')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const MessagesSendedYesterday = require('./MessagesSendedYesterday')
const moment = require('moment')

describe('MessagesSendedYesterday', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('returns the resume os messages sended yesterday', async () => {
    const licensee1 = await Licensee.create({ name: 'Alcateia', licenseKind: 'paid' })
    const contact1 = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: false,
      licensee: licensee1._id,
    })
    const messageOfYesterday1 = await Message.create({
      text: 'Message 1',
      number: contact1.number,
      contact: contact1._id,
      licensee: licensee1._id,
      destination: 'to-chat',
      sended: true,
      createdAt: moment().subtract(1, 'days'),
    })
    const messageOfYesterday2 = await Message.create({
      text: 'Message 2',
      number: contact1.number,
      contact: contact1._id,
      licensee: licensee1._id,
      destination: 'to-chat',
      sended: true,
      createdAt: moment().subtract(1, 'days'),
    })
    const messageOfYesterday3 = await Message.create({
      text: 'Not sended',
      number: contact1.number,
      contact: contact1._id,
      licensee: licensee1._id,
      destination: 'to-chat',
      sended: false,
      createdAt: moment().subtract(1, 'days'),
    })
    const messageOfTwoDays1 = await Message.create({
      text: 'Message 3',
      number: contact1.number,
      contact: contact1._id,
      licensee: licensee1._id,
      destination: 'to-chat',
      sended: true,
      createdAt: moment().subtract(2, 'days'),
    })
    const messageOfToday1 = await Message.create({
      text: 'Message 4',
      number: contact1.number,
      contact: contact1._id,
      licensee: licensee1._id,
      destination: 'to-chat',
      sended: true,
      createdAt: moment(),
    })

    const licensee2 = await Licensee.create({ name: 'Alcateia II', licenseKind: 'paid' })
    const contact2 = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: false,
      licensee: licensee2._id,
    })
    const messageOfYesterday4 = await Message.create({
      text: 'Message 1',
      number: contact2.number,
      contact: contact2._id,
      licensee: licensee2._id,
      destination: 'to-chat',
      sended: true,
      createdAt: moment().subtract(1, 'days'),
    })
    const messageOfYesterday5 = await Message.create({
      text: 'Message 2',
      number: contact2.number,
      contact: contact2._id,
      licensee: licensee2._id,
      destination: 'to-chat',
      sended: true,
      createdAt: moment().subtract(1, 'days'),
    })
    const messageOfYesterday6 = await Message.create({
      text: 'Not sended 2',
      number: contact2.number,
      contact: contact2._id,
      licensee: licensee2._id,
      destination: 'to-chat',
      sended: false,
      createdAt: moment().subtract(1, 'days'),
    })
    const messageOfTwoDays2 = await Message.create({
      text: 'Message 3',
      number: contact2.number,
      contact: contact2._id,
      licensee: licensee2._id,
      destination: 'to-chat',
      sended: true,
      createdAt: moment().subtract(2, 'days'),
    })
    const messageOfToday2 = await Message.create({
      text: 'Message 4',
      number: contact2.number,
      contact: contact2._id,
      licensee: licensee2._id,
      destination: 'to-chat',
      sended: true,
      createdAt: moment(),
    })

    const messagesSendedYesterday = new MessagesSendedYesterday()
    const records = await messagesSendedYesterday.report()

    expect(records.length).toEqual(2)
    expect(records[0]).toEqual(
      expect.objectContaining({
        licensee: expect.objectContaining({ name: 'Alcateia' }),
        success: {
          count: 2,
          messages: expect.arrayContaining([
            expect.objectContaining({ _id: messageOfYesterday1._id }),
            expect.objectContaining({ _id: messageOfYesterday2._id }),
          ]),
        },
        error: {
          count: 1,
          messages: expect.arrayContaining([expect.objectContaining({ _id: messageOfYesterday3._id })]),
        },
      })
    )
    expect(records[0].success.messages).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: messageOfTwoDays1._id }),
        expect.objectContaining({ _id: messageOfToday1._id }),
      ])
    )

    expect(records[1]).toEqual(
      expect.objectContaining({
        licensee: expect.objectContaining({ name: 'Alcateia II' }),
        success: {
          count: 2,
          messages: expect.arrayContaining([
            expect.objectContaining({ _id: messageOfYesterday4._id }),
            expect.objectContaining({ _id: messageOfYesterday5._id }),
          ]),
        },
        error: {
          count: 1,
          messages: expect.arrayContaining([expect.objectContaining({ _id: messageOfYesterday6._id })]),
        },
      })
    )
    expect(records[1].success.messages).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: messageOfTwoDays2._id }),
        expect.objectContaining({ _id: messageOfToday2._id }),
      ])
    )
  })
})
