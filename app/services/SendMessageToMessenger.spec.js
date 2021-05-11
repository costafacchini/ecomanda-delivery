const sendMessageToMessenger = require('./SendMessageToMessenger')
const Licensee = require('@models/Licensee')
const Chatapi = require('../plugins/messengers/Chatapi')

describe('sendMessageToMessenger', () => {
  const chatapiSendMessageSpy = jest.spyOn(Chatapi.prototype, 'sendMessage')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('asks the plugin to send message to messenger', async () => {
    const licensee = new Licensee({
      whatsappDefault: 'chatapi',
    })

    const body = {
      message: 'message',
    }

    await sendMessageToMessenger(body, licensee)

    expect(chatapiSendMessageSpy).toHaveBeenCalled()
  })
})
