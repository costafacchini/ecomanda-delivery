const closeChat = require('./CloseChat')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const Jivochat = require('../plugins/chats/Jivochat')
const mongoServer = require('../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')

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
    const licensee = await Licensee.create(
      licenseeFactory.build({
        chatDefault: 'jivochat',
        chatUrl: 'https://chat.url',
      })
    )

    const contact = await Contact.create(
      contactFactory.build({
        licensee: licensee,
      })
    )

    await Message.create(
      messageFactory.build({
        contact,
        licensee,
        _id: '609dcb059f560046cde64748',
      })
    )

    await closeChat({ messageId: '609dcb059f560046cde64748' })

    expect(jivochatCloseChatSpy).toHaveBeenCalledWith('609dcb059f560046cde64748')
  })
})
