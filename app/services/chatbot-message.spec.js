const transformChatbotBody = require('./chatbot-message')
const Licensee = require('@models/licensee')
const { queue } = require('@config/queue-server')

describe('transformChatbotBody', () => {
  const mockFunction = jest.spyOn(queue, 'addJobDispatcher')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('enqueues job to dispatcher action of plugin', () => {
    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      chatbotUrl: 'https://chatbot.url',
      chatbotAuthorizationToken: 'zjkdhf7'
    })

    const body = {
      message: 'text'
    }

    transformChatbotBody(body, licensee)

    expect(mockFunction).toHaveBeenCalledWith(
      'send-message-to-messenger',
      { body: '', url: 'https://chatbot.url', token: 'zjkdhf7' },
      expect.objectContaining({ chatbotDefault: 'landbot', chatbotUrl: 'https://chatbot.url', chatbotAuthorizationToken: 'zjkdhf7' })
    )
  })
})