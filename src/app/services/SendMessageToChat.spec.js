const sendMessageToChat = require('./SendMessageToChat')
const Licensee = require('@models/Licensee')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Jivochat = require('../plugins/chats/Jivochat')
const mongoServer = require('.jest/utils')

describe('sendMessageToChat', () => {
  const jivochatSendMessageSpy = jest.spyOn(Jivochat.prototype, 'sendMessage').mockImplementation(() => {})

  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('asks the plugin to send message to chat', async () => {
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

    await Message.create({
      text: 'Chat clodes by agent',
      number: 'jhd7879a7d9',
      contact: contact,
      licensee: licensee,
      destination: 'to-chat',
      kind: 'text',
      sended: false,
      _id: '609dcb059f560046cde64748',
    })

    const data = {
      messageId: '609dcb059f560046cde64748',
      url: 'https://messenger.url',
      token: 'token',
    }

    await sendMessageToChat(data)

    expect(jivochatSendMessageSpy).toHaveBeenCalledWith('609dcb059f560046cde64748', 'https://messenger.url')
  })
})
