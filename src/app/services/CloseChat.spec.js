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
  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('asks the plugin to close the chat', async () => {
    const jivochatCloseChatSpy = jest.spyOn(Jivochat.prototype, 'closeChat').mockImplementation(() => [])

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

    jivochatCloseChatSpy.mockRestore()
  })

  describe('when the licensee has a message on close chat', () => {
    it('returns actions to do after run', async () => {
      const jivochatCloseChatSpy = jest.spyOn(Jivochat.prototype, 'closeChat').mockImplementation(() => {
        return [{ _id: 'KSDF656DSD91NSE' }, { _id: 'OAR8Q54LDN02T' }]
      })

      const licensee = await Licensee.create(
        licenseeFactory.build({
          chatDefault: 'jivochat',
          chatUrl: 'https://chat.url',
          whatsappToken: 'token-whats',
          whatsappUrl: 'www.whatsappurl.com',
          messageOnCloseChat: 'Send on close chat',
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

      const actions = await closeChat({ messageId: '609dcb059f560046cde64748' })

      expect(actions.length).toEqual(2)
      expect(actions[0]).toEqual(
        expect.objectContaining({
          action: 'send-message-to-messenger',
          body: {
            messageId: 'KSDF656DSD91NSE',
            token: 'token-whats',
            url: 'www.whatsappurl.com',
          },
        })
      )

      jivochatCloseChatSpy.mockRestore()
    })
  })
})
