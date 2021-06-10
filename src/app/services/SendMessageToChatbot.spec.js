const sendMessageToChatbot = require('./SendMessageToChatbot')
const Licensee = require('@models/Licensee')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Landbot = require('../plugins/chatbots/Landbot')
const mongoServer = require('.jest/utils')

describe('sendMessageToChatbot', () => {
  const landbotSendMessageSpy = jest.spyOn(Landbot.prototype, 'sendMessage').mockImplementation(() => {})

  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('asks the plugin to send message to chatbot', async () => {
    const licensee = await Licensee.create({
      name: 'Alcateia Ltds',
      active: true,
      licenseKind: 'demo',
      chatbotDefault: 'landbot',
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

    await sendMessageToChatbot(data)

    expect(landbotSendMessageSpy).toHaveBeenCalledWith('609dcb059f560046cde64748', 'https://messenger.url', 'token')
  })
})
