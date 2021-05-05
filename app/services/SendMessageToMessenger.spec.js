const sendMessageToMessenger = require('./SendMessageToMessenger')
const Licensee = require('@models/Licensee')
const Chatapi = require('../plugins/messengers/Chatapi')

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
