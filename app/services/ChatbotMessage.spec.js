const transformChatbotBody = require('./ChatbotMessage')
const Licensee = require('@models/Licensee')
const queueServer = require('@config/queue')
const Landbot = require('../plugins/chatbots/Landbot')

describe('transformChatbotBody', () => {
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('enqueues job to send message to messenger', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [{ _id: 'KSDF656DSD91NSE' }, { _id: 'OAR8Q54LDN02T' }]
      })

    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      chatbotUrl: 'https://chatbot.url',
      chatbotAuthorizationToken: 'zjkdhf7',
    })

    const body = {
      message: 'text',
    }

    await transformChatbotBody(body, licensee)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(queueServerAddJobSpy).toHaveBeenCalledTimes(2)
    expect(queueServerAddJobSpy).toHaveBeenCalledWith(
      'send-message-to-messenger',
      { messageId: 'KSDF656DSD91NSE', url: 'https://chatbot.url', token: 'zjkdhf7' },
      expect.objectContaining({
        chatbotDefault: 'landbot',
        chatbotUrl: 'https://chatbot.url',
        chatbotAuthorizationToken: 'zjkdhf7',
      })
    )

    expect(queueServerAddJobSpy).toHaveBeenCalledWith(
      'send-message-to-messenger',
      { messageId: 'OAR8Q54LDN02T', url: 'https://chatbot.url', token: 'zjkdhf7' },
      expect.objectContaining({
        chatbotDefault: 'landbot',
        chatbotUrl: 'https://chatbot.url',
        chatbotAuthorizationToken: 'zjkdhf7',
      })
    )
  })

  it('does not enqueue job if body is invalid', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return []
      })

    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      chatbotUrl: 'https://chatbot.url',
      chatbotAuthorizationToken: 'zjkdhf7',
    })

    const body = {}

    await transformChatbotBody(body, licensee)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body)

    expect(queueServerAddJobSpy).not.toBeCalled()
  })
})
