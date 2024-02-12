const transferToChat = require('./TransferToChat')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Rocketchat = require('../plugins/chats/Rocketchat')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('transferToChat', () => {
  const rocketchatTransferSpy = jest.spyOn(Rocketchat.prototype, 'transfer').mockImplementation(() => {})

  beforeEach(async () => {
    jest.clearAllMocks()
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('asks the plugin to transfer to chat', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(
      licenseeFactory.build({
        chatDefault: 'rocketchat',
        chatUrl: 'https://chat.url',
      }),
    )

    const contact = await Contact.create(
      contactFactory.build({
        licensee,
      }),
    )

    await Message.create(
      messageFactory.build({
        contact,
        licensee,
        _id: '609dcb059f560046cde64748',
      }),
    )

    const data = {
      messageId: '609dcb059f560046cde64748',
      url: 'https://messenger.url',
      token: 'token',
    }

    await transferToChat(data)

    expect(rocketchatTransferSpy).toHaveBeenCalledWith('609dcb059f560046cde64748', 'https://messenger.url')
  })
})
