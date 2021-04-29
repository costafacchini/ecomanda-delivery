const transformChatbotTransferBody = require('./chatbot-transfer')
const Licensee = require('@models/licensee')
const { queue } = require('@config/queue-server')

describe('transformChatbotTransferBody', () => {
  const mockFunction = jest.spyOn(queue, 'addJobDispatcher')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('enqueues job to dispatcher action of plugin', () => {
    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      whatsappUrl: 'https://chatbot.url',
      whatsappToken: 'zjkdhf7'
    })

    const body = {
      message: 'text'
    }

    transformChatbotTransferBody(body, licensee)

    expect(mockFunction).toHaveBeenCalledWith(
      'send-message-to-chat',
      { body: '', url: 'https://chatbot.url', token: 'zjkdhf7' },
      expect.objectContaining({ chatbotDefault: 'landbot', whatsappUrl: 'https://chatbot.url', whatsappToken: 'zjkdhf7' })
    )
  })
})