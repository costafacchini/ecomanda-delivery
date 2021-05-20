const transformMessengerBody = require('./MessengerMessage')
const Licensee = require('@models/Licensee')
const queueServer = require('@config/queue')
const Chatapi = require('../plugins/messengers/Chatapi')

describe('transformMessengerBody', () => {
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('enqueues job to dispatcher send-message-to-chatbot if message destination is to-chatbot', async () => {
    const messengerPluginResponseToMessages = jest.spyOn(Chatapi.prototype, 'responseToMessages').mockImplementation(() => {
      return [{ _id: 'KSDF656DSD91NSE', destination: 'to-chatbot' }, { _id: 'OAR8Q54LDN02T', destination: 'to-chat' }]
    })

    const licensee = new Licensee({
      whatsappDefault: 'chatapi',
      chatbotUrl: 'https://whatsapp.url',
      chatbotAuthorizationToken: 'ljsdf12g',
      chatUrl: 'https://chat.url',
    })

    const body = {
      message: {
        type: 'message',
      },
    }

    await transformMessengerBody(body, licensee)

    expect(messengerPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(queueServerAddJobSpy).toHaveBeenCalledTimes(2)
    expect(queueServerAddJobSpy).toHaveBeenCalledWith(
      'send-message-to-chatbot',
      { messageId: 'KSDF656DSD91NSE', url: 'https://whatsapp.url', token: 'ljsdf12g' },
      expect.objectContaining({
        whatsappDefault: 'chatapi',
        chatbotUrl: 'https://whatsapp.url',
        chatbotAuthorizationToken: 'ljsdf12g',
        chatUrl: 'https://chat.url',
      })
    )

    expect(queueServerAddJobSpy).toHaveBeenCalledWith(
      'send-message-to-chat',
      { messageId: 'OAR8Q54LDN02T', url: 'https://chat.url', token: '' },
      expect.objectContaining({
        whatsappDefault: 'chatapi',
        chatbotUrl: 'https://whatsapp.url',
        chatbotAuthorizationToken: 'ljsdf12g',
        chatUrl: 'https://chat.url',
      })
    )
  })

  it('does not enqueue job if body is invalid', async () => {
    const messengerPluginResponseToMessages = jest.spyOn(Chatapi.prototype, 'responseToMessages').mockImplementation(() => {
      return []
    })

    const licensee = new Licensee({
      chatDefault: 'jivochat',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token',
    })

    const body = {
      message: {
        type: 'typein',
      },
    }

    await transformMessengerBody(body, licensee)

    expect(messengerPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(queueServerAddJobSpy).not.toBeCalled()
  })
})
