const transformChatbotBody = require('./ChatbotMessage')
const Licensee = require('@models/Licensee')
const Landbot = require('../plugins/chatbots/Landbot')

describe('transformChatbotBody', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('responds with action to send message to messenger', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [{ _id: 'KSDF656DSD91NSE' }, { _id: 'OAR8Q54LDN02T' }]
      })

    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token',
    })

    const body = {
      message: 'text',
    }

    const actions = await transformChatbotBody(body, licensee)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(actions[0].action).toEqual('send-message-to-messenger')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://chat.url', token: 'token' })
    expect(actions[0].licensee).toEqual(
      expect.objectContaining({
        chatbotDefault: 'landbot',
        whatsappDefault: 'chatapi',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token',
      })
    )

    expect(actions[1].action).toEqual('send-message-to-messenger')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://chat.url', token: 'token' })
    expect(actions[1].licensee).toEqual(
      expect.objectContaining({
        chatbotDefault: 'landbot',
        whatsappDefault: 'chatapi',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token',
      })
    )

    expect(actions.length).toEqual(2)
  })

  it('responds with blank actions if body is invalid', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return []
      })

    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://chat.url',
      whatsappToken: 'token',
    })

    const body = {}

    const actions = await transformChatbotBody(body, licensee)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(actions.length).toEqual(0)
  })
})
