const sendMessageToChat = require('./SendMessageToChat')
const Licensee = require('@models/Licensee')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Jivochat = require('../plugins/chats/Jivochat')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')

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
    const licensee = await Licensee.create(
      licenseeFactory.build({
        chatDefault: 'jivochat',
        chatUrl: 'https://chat.url',
      })
    )

    const contact = await Contact.create(
      contactFactory.build({
        talkingWithChatBot: true,
        licensee,
      })
    )

    await Message.create(
      messageFactory.build({
        contact,
        licensee,
        destination: 'to-chat',
        _id: '609dcb059f560046cde64748',
      })
    )

    const data = {
      messageId: '609dcb059f560046cde64748',
      url: 'https://messenger.url',
      token: 'token',
    }

    await sendMessageToChat(data)

    expect(jivochatSendMessageSpy).toHaveBeenCalledWith('609dcb059f560046cde64748', 'https://messenger.url')
  })
})
