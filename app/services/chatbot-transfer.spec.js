const transformChatbotTransferBody = require('./chatbot-transfer')
const Licensee = require('@models/licensee')
const queueServer = require('@config/queue')

describe('transformChatbotTransferBody', () => {
  const mockFunction = jest.spyOn(queueServer, 'addJob')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('enqueues job to dispatcher action of plugin', async () => {
    const licensee = new Licensee({
      chatbotDefault: 'landbot',
      whatsappUrl: 'https://chatbot.url',
      whatsappToken: 'zjkdhf7'
    })

    const body = {
      message: 'text'
    }

    await transformChatbotTransferBody(body, licensee)

    expect(mockFunction).toHaveBeenCalledWith(
      'send-message-to-chat',
      { body: '', url: 'https://chatbot.url', token: 'zjkdhf7' },
      expect.objectContaining({ chatbotDefault: 'landbot', whatsappUrl: 'https://chatbot.url', whatsappToken: 'zjkdhf7' })
    )
  })
})
