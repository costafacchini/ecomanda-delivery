const closeChat = require('./CloseChat')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const Jivochat = require('../plugins/chats/Jivochat')
const mongoServer = require('.jest/utils')

describe('closeChat', () => {
  const jivochatCloseChatSpy = jest.spyOn(Jivochat.prototype, 'closeChat')

  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('asks the plugin to close the chat', async () => {
    const licensee = await Licensee.create({
      name: 'Alcateia Ltds',
      active: true,
      licenseKind: 'demo',
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url',
    })

    const contact = await Contact.create({
      name: 'John Doe',
      number: '5593165392832',
      type: '@c.us',
      email: 'john@doe.com',
      talkingWithChatBot: true,
      licensee: licensee,
    })

    const message = await Message.create({
      text: 'Chat clodes by agent',
      number: 'jhd7879a7d9',
      contact: contact,
      licensee: licensee,
      destination: 'to-chat',
      kind: 'text',
      sended: false,
      _id: '609dcb059f560046cde64748',
    })

    await closeChat({ messageId: message._id.toString() }, licensee)

    expect(jivochatCloseChatSpy).toHaveBeenCalledWith(
      '609dcb059f560046cde64748',
      expect.objectContaining({
        name: 'Alcateia Ltds',
        active: true,
        licenseKind: 'demo',
        chatDefault: 'jivochat',
        chatUrl: 'https://chat.url',
      })
    )
  })
})
