const sendMessageToChatbot = require('./SendMessageToChatbot')
const Licensee = require('@models/Licensee')
const Landbot = require('../plugins/chatbots/Landbot')

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
