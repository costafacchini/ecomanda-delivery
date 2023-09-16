const sendMessageToChatbot = require('./SendMessageToChatbot')
const Licensee = require('@models/Licensee')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Landbot = require('../plugins/chatbots/Landbot')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')

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
    const licensee = await Licensee.create(
      licenseeFactory.build({
        chatbotDefault: 'landbot',
      }),
    )

    const contact = await Contact.create(
      contactFactory.build({
        talkingWithChatBot: true,
        licensee,
      }),
    )

    await Message.create(
      messageFactory.build({
        contact,
        licensee,
        destination: 'to-chat',
        _id: '609dcb059f560046cde64748',
      }),
    )

    const data = {
      messageId: '609dcb059f560046cde64748',
      url: 'https://messenger.url',
      token: 'token',
    }

    await sendMessageToChatbot(data)

    expect(landbotSendMessageSpy).toHaveBeenCalledWith('609dcb059f560046cde64748', 'https://messenger.url', 'token')
  })
})
