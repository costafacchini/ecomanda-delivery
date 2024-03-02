const sendMessageToMessenger = require('./SendMessageToMessenger')
const Message = require('@models/Message')
const Dialog = require('../plugins/messengers/Dialog')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')
const { ContactRepositoryDatabase } = require('@repositories/contact')

describe('sendMessageToMessenger', () => {
  const dialogSendMessageSpy = jest.spyOn(Dialog.prototype, 'sendMessage').mockImplementation(() => {})

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('asks the plugin to send message to messenger', async () => {
    const licenseeRepository = new LicenseeRepositoryDatabase()
    const licensee = await licenseeRepository.create(
      licenseeFactory.build({
        whatsappDefault: 'dialog',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token',
      }),
    )

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.create(
      contactFactory.build({
        licensee,
      }),
    )

    const message = await Message.create(
      messageFactory.build({
        contact,
        licensee,
      }),
    )

    const data = {
      messageId: message._id,
      url: 'https://www.dialog.com',
      token: 'k4d5h8fyt',
    }

    await sendMessageToMessenger(data)

    expect(dialogSendMessageSpy).toHaveBeenCalledWith(message._id, 'https://www.dialog.com', 'k4d5h8fyt')
  })
})
