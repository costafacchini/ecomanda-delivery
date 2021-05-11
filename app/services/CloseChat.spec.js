const closeChat = require('./CloseChat')
const Licensee = require('@models/Licensee')
const Jivochat = require('../plugins/chats/Jivochat')

describe('closeChat', () => {
  const jivochatCloseChatSpy = jest.spyOn(Jivochat.prototype, 'closeChat')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('asks the plugin to close the chat', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url',
    })

    const body = {
      message: 'message',
    }

    await closeChat(body, licensee)

    expect(jivochatCloseChatSpy).toHaveBeenCalled()
  })
})
