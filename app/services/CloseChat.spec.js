const closeChat = require('./CloseChat')
const Licensee = require('@models/Licensee')
const Jivochat = require('../plugins/chats/Jivochat')

describe('closeChat', () => {
  const mockFunction = jest.spyOn(Jivochat.prototype, 'closeChat')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('asks the plugin to close the chat', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url'
    })

    const body = {
      message: 'message'
    }

    await closeChat(body, licensee)

    expect(mockFunction).toHaveBeenCalled()
  })
})
