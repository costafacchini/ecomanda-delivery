const transformChatBody = require('./ChatMessage')
const Licensee = require('@models/Licensee')
const queueServer = require('@config/queue')
const Jivochat = require('../plugins/chats/Jivochat')

describe('transformChatBody', () => {
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('enqueues job to dispatcher action of plugin', async () => {
    const chatPluginResponseToMessages = jest
      .spyOn(Jivochat.prototype, 'responseToMessage')
      .mockImplementation(() => {
        return { _id: 'KSDF656DSD91NSE' }
      })

    const licensee = new Licensee({
      chatDefault: 'jivochat',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token'
    })

    const body = {
      message: {
        type: 'message',
      },
    }

    await transformChatBody(body, licensee)

    expect(chatPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(queueServerAddJobSpy).toHaveBeenCalledWith(
      'send-message-to-messenger',
      { messageId: 'KSDF656DSD91NSE', url: 'https://chat.url', token: 'token' },
      expect.objectContaining({
        chatDefault: 'jivochat',
        whatsappDefault: 'chatapi',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token'
      })
    )
  })

  it('does not enqueue job if body is invalid', async () => {
    const chatPluginResponseToMessages = jest
      .spyOn(Jivochat.prototype, 'responseToMessage')
      .mockImplementation(() => {
        return undefined
      })

    const licensee = new Licensee({
      chatDefault: 'jivochat',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token'
    })

    const body = {
      message: {
        type: 'typein',
      },
    }

    await transformChatBody(body, licensee)

    expect(chatPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(queueServerAddJobSpy).not.toBeCalled()
  })
})
