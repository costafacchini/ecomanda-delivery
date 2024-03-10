const sendMessageToChatbot = require('./SendMessageToChatbot')
const Landbot = require('../plugins/chatbots/Landbot')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')
const { ContactRepositoryDatabase } = require('@repositories/contact')
const { MessageRepositoryDatabase } = require('@repositories/message')

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
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(
      licenseeFactory.build({
        chatbotDefault: 'landbot',
      }),
    )

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(
      contactFactory.build({
        talkingWithChatBot: true,
        licensee,
      }),
    )

    const messageRepository = new MessageRepositoryDatabase()
    await messageRepository.create(
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
