const sendMessageToMessenger = require('./send-message-to-messenger')
const Licensee = require('@models/licensee')
const Chatapi = require('../plugins/messengers/chatapi')

describe('sendMessageToMessenger', () => {
  const mockFunction = jest.spyOn(Chatapi.prototype, 'sendMessage')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('asks the plugin to send message to messenger', async () => {
    const licensee = new Licensee({
      whatsappDefault: 'chatapi'
    })

    const body = {
      message: 'message'
    }

    await sendMessageToMessenger(body, licensee)

    expect(mockFunction).toHaveBeenCalled()
  })
})
