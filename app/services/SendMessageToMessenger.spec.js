const sendMessageToMessenger = require('./SendMessageToMessenger')
const Licensee = require('@models/Licensee')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Chatapi = require('../plugins/messengers/Chatapi')
const mongoServer = require('.jest/utils')

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
    const licensee = await Licensee.create({
      licenseKind: 'demo',
      name: 'Alcatéia',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token',
    })

    const contact = await Contact.create({
      name: 'John Doe',
      number: '5593165392832@c.us',
      type: '@c.us',
      talkingWithChatBot: false,
      licensee: licensee._id,
    })

    const message = await Message.create({
      text: 'Message to send',
      number: 'jhd7879a7d9',
      contact: contact._id,
      licensee: licensee._id,
      destination: 'to-messenger',
      sended: false,
    })

    const data = {
      messageId: message._id,
      url: 'https://www.chatapi.com',
      token: 'k4d5h8fyt',
    }

    await sendMessageToMessenger(data)

    expect(chatapiSendMessageSpy).toHaveBeenCalledWith(message._id, 'https://www.chatapi.com', 'k4d5h8fyt')
  })
})
