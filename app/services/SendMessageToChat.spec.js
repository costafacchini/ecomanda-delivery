const sendMessageToChat = require('./SendMessageToChat')
const Licensee = require('@models/Licensee')
const Jivochat = require('../plugins/chats/Jivochat')

describe('sendMessageToChat', () => {
  const jivochatSendMessageSpy = jest.spyOn(Jivochat.prototype, 'sendMessage')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('asks the plugin to send message to chat', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
    })

    const body = {
      message: 'message',
    }

    await sendMessageToChat(body, licensee)

    expect(jivochatSendMessageSpy).toHaveBeenCalled()
  })
})
