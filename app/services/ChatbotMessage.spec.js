const transformChatbotBody = require('./ChatbotMessage')
const Licensee = require('@models/Licensee')
const queueServer = require('@config/queue')

describe('transformChatbotBody', () => {
  const mockFunction = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('enqueues job to dispatcher action of plugin', async () => {
    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      chatbotUrl: 'https://chatbot.url',
      chatbotAuthorizationToken: 'zjkdhf7'
    })

    const body = {
      message: 'text'
    }

    await transformChatbotBody(body, licensee)

    expect(mockFunction).toHaveBeenCalledWith(
      'send-message-to-messenger',
      { body: '', url: 'https://chatbot.url', token: 'zjkdhf7' },
      expect.objectContaining({ chatbotDefault: 'landbot', chatbotUrl: 'https://chatbot.url', chatbotAuthorizationToken: 'zjkdhf7' })
    )
  })
})
