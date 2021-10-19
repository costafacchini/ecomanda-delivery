const resetChatbots = require('./ResetChatbots')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const mongoServer = require('.jest/utils')
const fetchMock = require('fetch-mock')

describe('resetChatbots', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    fetchMock.reset()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('calls the drop conversation to reset chatbot to licensees that use chatbot and contacts that talking with chatbot and the last message has destination to messenger and the sended a hour ago', async () => {
    const licensee = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      chatbotDefault: 'landbot',
      chatbotUrl: 'https://landbot.url',
      chatbotAuthorizationToken: 'ljsdf12g',
      useChatbot: true,
      chatbotApiToken: 'api-token',
    })

    const contact = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: true,
      licensee: licensee._id,
      landbotId: 'landbot-id',
    })

    await Message.create({
      text: 'Message 1',
      number: contact.number,
      contact: contact._id,
      licensee: licensee._id,
      destination: 'to-messenger',
      sended: true,
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })

    const contactThatMessageDoesNotCreatedInTimeLimit = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: true,
      licensee: licensee._id,
      landbotId: 'landbot-id',
    })

    await Message.create({
      text: 'Message 1',
      number: contactThatMessageDoesNotCreatedInTimeLimit.number,
      contact: contactThatMessageDoesNotCreatedInTimeLimit._id,
      licensee: licensee._id,
      destination: 'to-messenger',
      sended: true,
      createdAt: new Date(),
    })

    const contactThatMessageDoesNotSended = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: true,
      licensee: licensee._id,
      landbotId: 'landbot-id',
    })

    await Message.create({
      text: 'Message 1',
      number: contactThatMessageDoesNotSended.number,
      contact: contactThatMessageDoesNotSended._id,
      licensee: licensee._id,
      destination: 'to-messenger',
      sended: false,
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })

    const contactThatNotTalkingWithChatbot = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: false,
      licensee: licensee._id,
      landbotId: 'landbot-id',
    })

    await Message.create({
      text: 'Message 1',
      number: contactThatNotTalkingWithChatbot.number,
      contact: contactThatNotTalkingWithChatbot._id,
      licensee: licensee._id,
      destination: 'to-messenger',
      sended: true,
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })

    const contactWithoutLandbotId = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: true,
      licensee: licensee._id,
    })

    await Message.create({
      text: 'Message 1',
      number: contactWithoutLandbotId.number,
      contact: contactWithoutLandbotId._id,
      licensee: licensee._id,
      destination: 'to-messenger',
      sended: true,
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })

    const licenseeWhithoutChatbot = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      chatbotDefault: 'landbot',
      chatbotUrl: 'https://landbot.url',
      chatbotAuthorizationToken: 'ljsdf12g',
      useChatbot: false,
      chatbotApiToken: 'api-token',
    })

    const contact2 = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: true,
      licensee: licenseeWhithoutChatbot._id,
      landbotId: 'landbot-id',
    })

    await Message.create({
      text: 'Message 1',
      number: contact2.number,
      contact: contact2._id,
      licensee: licenseeWhithoutChatbot._id,
      destination: 'to-messenger',
      sended: true,
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })

    const licenseeWithoutChatbotApiToken = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      chatbotDefault: 'landbot',
      chatbotUrl: 'https://landbot.url',
      chatbotAuthorizationToken: 'ljsdf12g',
      useChatbot: true,
    })

    const contact3 = await Contact.create({
      number: '551190283745',
      talkingWithChatBot: true,
      licensee: licenseeWithoutChatbotApiToken._id,
      landbotId: 'landbot-id',
    })

    await Message.create({
      text: 'Message 1',
      number: contact3.number,
      contact: contact3._id,
      licensee: licenseeWithoutChatbotApiToken._id,
      destination: 'to-messenger',
      sended: true,
      createdAt: new Date(2021, 6, 3, 0, 0, 0),
    })

    fetchMock.deleteOnce((url, { headers }) => {
      return url === 'https://api.landbot.io/v1/customers/landbot-id/' && headers['Authorization'] === 'Token api-token'
    }, 204)

    expect(contact.landbotId).toEqual('landbot-id')

    await resetChatbots()

    const contactChanged = await Contact.findById(contact._id)
    expect(contactChanged.landbotId).toEqual(null)

    const contactThatMessageDoesNotCreatedInTimeLimitChanged = await Contact.findById(
      contactThatMessageDoesNotCreatedInTimeLimit._id
    )
    expect(contactThatMessageDoesNotCreatedInTimeLimitChanged.landbotId).toEqual('landbot-id')

    const contactcontactThatMessageDoesNotSended = await Contact.findById(contactThatMessageDoesNotSended._id)
    expect(contactcontactThatMessageDoesNotSended.landbotId).toEqual('landbot-id')

    const contactThatNotTalkingWithChatbotChanged = await Contact.findById(contactThatNotTalkingWithChatbot._id)
    expect(contactThatNotTalkingWithChatbotChanged.landbotId).toEqual('landbot-id')

    const contact2NotChanged = await Contact.findById(contact2._id)
    expect(contact2NotChanged.landbotId).toEqual('landbot-id')

    const contact3NotChanged = await Contact.findById(contact3._id)
    expect(contact3NotChanged.landbotId).toEqual('landbot-id')

    await fetchMock.flush(true)

    expect(fetchMock.done()).toBe(true)
    expect(fetchMock.calls()).toHaveLength(1)
  })
})
