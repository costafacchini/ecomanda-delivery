const transformChatbotTransferBody = require('./ChatbotTransfer')
const Licensee = require('@models/Licensee')
const Landbot = require('../plugins/chatbots/Landbot')

describe('transformChatbotTransferBody', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('responds with action to transfer message to chat', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseTransferToMessage')
      .mockImplementation(() => {
        return { _id: 'KSDF656DSD91NSE' }
      })

    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      chatUrl: 'https://chat.url',
    })

    const body = {
      message: 'text',
    }

    const actions = await transformChatbotTransferBody(body, licensee)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(actions[0].action).toEqual('transfer-to-chat')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://chat.url' })
    expect(actions[0].licensee).toEqual(
      expect.objectContaining({
        chatbotDefault: 'landbot',
        chatUrl: 'https://chat.url',
      })
    )

    expect(actions.length).toEqual(1)
  })

  it('responds with blank actions if body is invalid', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseTransferToMessage')
      .mockImplementation(() => {
        return null
      })

    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      chatUrl: 'https://chat.url',
    })

    const body = {}

    const actions = await transformChatbotTransferBody(body, licensee)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(actions.length).toEqual(0)
  })
})
