const sendMessageToChat = require('./SendMessageToChat')
const Licensee = require('@models/Licensee')
const Jivochat = require('../plugins/chats/Jivochat')

describe('sendMessageToChat', () => {
  const jivochatSendMessageSpy = jest.spyOn(Jivochat.prototype, 'sendMessage').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('asks the plugin to send message to chat', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
    })

    const body = {
      messageId: 'NSO25PA04GST830HS',
      url: 'https://messenger.url',
      token: 'token',
    }

    await sendMessageToChat(body, licensee)

    expect(jivochatSendMessageSpy).toHaveBeenCalledWith('NSO25PA04GST830HS', 'https://messenger.url', 'token')
  })
})
