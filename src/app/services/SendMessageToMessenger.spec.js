const sendMessageToMessenger = require('./SendMessageToMessenger')
const Licensee = require('@models/Licensee')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Chatapi = require('../plugins/messengers/Chatapi')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const { message: messageFactory } = require('@factories/message')

describe('sendMessageToMessenger', () => {
  const chatapiSendMessageSpy = jest.spyOn(Chatapi.prototype, 'sendMessage').mockImplementation(() => {})

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('asks the plugin to send message to messenger', async () => {
    const licensee = await Licensee.create(
      licenseeFactory.build({
        whatsappDefault: 'chatapi',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token',
      })
    )

    const contact = await Contact.create(
      contactFactory.build({
        licensee,
      })
    )

    const message = await Message.create(
      messageFactory.build({
        contact,
        licensee,
      })
    )

    const data = {
      messageId: message._id,
      url: 'https://www.chatapi.com',
      token: 'k4d5h8fyt',
    }

    await sendMessageToMessenger(data)

    expect(chatapiSendMessageSpy).toHaveBeenCalledWith(message._id, 'https://www.chatapi.com', 'k4d5h8fyt')
  })
})
