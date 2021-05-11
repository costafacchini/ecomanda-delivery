const sendMessageToChatbot = require('./SendMessageToChatbot')
const Licensee = require('@models/Licensee')
const Landbot = require('../plugins/chatbots/Landbot')

describe('sendMessageToChatbot', () => {
  const landbotSendMessageSpy = jest.spyOn(Landbot.prototype, 'sendMessage').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('asks the plugin to send message to chatbot', async () => {
    const licensee = new Licensee({
      chatbotDefault: 'landbot',
    })

    const body = {
      messageId: 'NSO25PA04GST830HS',
      url: 'https://messenger.url',
      token: 'token',
    }

    await sendMessageToChatbot(body, licensee)

    expect(landbotSendMessageSpy).toHaveBeenCalledWith('NSO25PA04GST830HS', 'https://messenger.url', 'token')
  })
})
