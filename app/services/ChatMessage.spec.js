const transformChatBody = require('./ChatMessage')
const Licensee = require('@models/Licensee')
const Jivochat = require('../plugins/chats/Jivochat')

describe('transformChatBody', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('responds with action to dispatcher action of plugin', async () => {
    const chatPluginResponseToMessages = jest.spyOn(Jivochat.prototype, 'responseToMessages').mockImplementation(() => {
      return [{ _id: 'KSDF656DSD91NSE' }, { _id: 'OAR8Q54LDN02T' }]
    })

    const licensee = new Licensee({
      chatDefault: 'jivochat',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token',
    })

    const body = {
      message: {
        type: 'message',
      },
    }

    const actions = await transformChatBody(body, licensee)

    expect(chatPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(actions[0].action).toEqual('send-message-to-messenger')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://chat.url', token: 'token' })
    expect(actions[0].licensee).toEqual(
      expect.objectContaining({
        chatDefault: 'jivochat',
        whatsappDefault: 'chatapi',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token',
      })
    )

    expect(actions[1].action).toEqual('send-message-to-messenger')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://chat.url', token: 'token' },)
    expect(actions[1].licensee).toEqual(
      expect.objectContaining({
        chatDefault: 'jivochat',
        whatsappDefault: 'chatapi',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token',
      })
    )

    expect(actions.length).toEqual(2)
  })

  it('responds with blank actions if body is invalid', async () => {
    const chatPluginResponseToMessages = jest.spyOn(Jivochat.prototype, 'responseToMessages').mockImplementation(() => {
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

    const actions = await transformChatBody(body, licensee)

    expect(chatPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(actions.length).toEqual(0)
  })
})
