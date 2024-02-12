const closeChat = require('./CloseChat')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const Rocketchat = require('../plugins/chats/Rocketchat')
const mongoServer = require('../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('closeChat', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('asks the plugin to close the chat', async () => {
    const rocketchatCloseChatSpy = jest.spyOn(Rocketchat.prototype, 'closeChat').mockImplementation(() => [])

    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(
      licenseeFactory.build({
        chatDefault: 'rocketchat',
        chatUrl: 'https://chat.url',
      }),
    )

    const contact = await Contact.create(
      contactFactory.build({
        licensee: licensee,
      }),
    )

    await Message.create(
      messageFactory.build({
        contact,
        licensee,
        _id: '609dcb059f560046cde64748',
      }),
    )

    await closeChat({ messageId: '609dcb059f560046cde64748' })

    expect(rocketchatCloseChatSpy).toHaveBeenCalledWith('609dcb059f560046cde64748')

    rocketchatCloseChatSpy.mockRestore()
  })

  describe('when the licensee has a message on close chat', () => {
    it('returns actions to do after run', async () => {
      const rocketchatCloseChatSpy = jest.spyOn(Rocketchat.prototype, 'closeChat').mockImplementation(() => {
        return [{ _id: 'KSDF656DSD91NSE' }, { _id: 'OAR8Q54LDN02T' }]
      })

      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(
        licenseeFactory.build({
          chatDefault: 'rocketchat',
          chatUrl: 'https://chat.url',
          whatsappToken: 'token-whats',
          whatsappUrl: 'www.whatsappurl.com',
          messageOnCloseChat: 'Send on close chat',
        }),
      )

      const contact = await Contact.create(
        contactFactory.build({
          licensee: licensee,
        }),
      )

      await Message.create(
        messageFactory.build({
          contact,
          licensee,
          _id: '609dcb059f560046cde64748',
        }),
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
        }),
      )

      rocketchatCloseChatSpy.mockRestore()
    })
  })
})
