const transformMessengerBody = require('./MessengerMessage')
const Licensee = require('@models/Licensee')
const Chatapi = require('../plugins/messengers/Chatapi')

describe('transformMessengerBody', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('responds with action to send message to chat and chatbot', async () => {
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

    const actions = await transformMessengerBody(body, licensee)

    expect(messengerPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(actions[0].action).toEqual('send-message-to-chatbot')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://whatsapp.url', token: 'ljsdf12g' })
    expect(actions[0].licensee).toEqual(
      expect.objectContaining({
        whatsappDefault: 'chatapi',
        chatbotUrl: 'https://whatsapp.url',
        chatbotAuthorizationToken: 'ljsdf12g',
        chatUrl: 'https://chat.url',
      })
    )

    expect(actions[1].action).toEqual('send-message-to-chat')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://chat.url', token: '' })
    expect(actions[1].licensee).toEqual(
      expect.objectContaining({
        whatsappDefault: 'chatapi',
        chatbotUrl: 'https://whatsapp.url',
        chatbotAuthorizationToken: 'ljsdf12g',
        chatUrl: 'https://chat.url',
      })
    )

    expect(actions.length).toEqual(2)
  })

  it('responds with blank actions if body is invalid', async () => {
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

    const actions = await transformMessengerBody(body, licensee)

    expect(messengerPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(actions.length).toEqual(0)
  })
})
