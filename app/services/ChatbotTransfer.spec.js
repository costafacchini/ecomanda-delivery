const transformChatbotTransferBody = require('./ChatbotTransfer')
const Licensee = require('@models/Licensee')
const queueServer = require('@config/queue')
const Landbot = require('../plugins/chatbots/Landbot')

describe('transformChatbotTransferBody', () => {
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('enqueues job to transfer message to chat', async () => {
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

    await transformChatbotTransferBody(body, licensee)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(queueServerAddJobSpy).toHaveBeenCalledWith(
      'transfer-to-chat',
      { messageId: 'KSDF656DSD91NSE', url: 'https://chat.url' },
      expect.objectContaining({
        chatbotDefault: 'landbot',
        chatUrl: 'https://chat.url',
      })
    )
  })

  it('does not enqueue job if body is invalid', async () => {
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

    await transformChatbotTransferBody(body, licensee)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(queueServerAddJobSpy).not.toBeCalled()
  })
})
