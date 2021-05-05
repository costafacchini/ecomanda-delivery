const transformChatbotBody = require('./chatbot-message')
const Licensee = require('@models/licensee')
const queueServer = require('@config/queue')

describe('transformChatbotBody', () => {
  const mockFunction = jest.spyOn(queueServer, 'addJob')

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
