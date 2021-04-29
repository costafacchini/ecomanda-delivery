const sendMessageToChatbot = require('./send-message-to-chatbot')
const Licensee = require('@models/licensee')
const Landbot = require('../plugins/chatbots/landbot')

describe('sendMessageToChatbot', () => {
  const mockFunction = jest.spyOn(Landbot.prototype, 'sendMessage')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('asks the plugin to send message to chatbot', async () => {
    const licensee = new Licensee({
      chatbotDefault: 'landbot'
    })

    const body = {
      message: 'message'
    }

    await sendMessageToChatbot(body, licensee)

    expect(mockFunction).toHaveBeenCalled()
  })
})