const sendMessageToChat = require('./SendMessageToChat')
const Licensee = require('@models/Licensee')
const Jivochat = require('../plugins/chats/Jivochat')

describe('sendMessageToChat', () => {
  const mockFunction = jest.spyOn(Jivochat.prototype, 'sendMessage')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('asks the plugin to send message to chat', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat'
    })

    const body = {
      message: 'message'
    }

    await sendMessageToChat(body, licensee)

    expect(mockFunction).toHaveBeenCalled()
  })
})
