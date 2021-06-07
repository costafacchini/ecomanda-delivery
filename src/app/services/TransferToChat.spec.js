const transferToChat = require('./TransferToChat')
const Licensee = require('@models/Licensee')
const Jivochat = require('../plugins/chats/Jivochat')

describe('transferToChat', () => {
  const jivochatTransferSpy = jest.spyOn(Jivochat.prototype, 'transfer').mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('asks the plugin to transfer to chat', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
    })

    const body = {
      messageId: 'NSO25PA04GST830HS',
      url: 'https://messenger.url',
      token: 'token',
    }

    await transferToChat(body, licensee)

    expect(jivochatTransferSpy).toHaveBeenCalledWith('NSO25PA04GST830HS', 'https://messenger.url', 'token')
  })
})
