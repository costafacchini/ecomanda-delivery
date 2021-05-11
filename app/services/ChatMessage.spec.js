const transformChatBody = require('./ChatMessage')
const Licensee = require('@models/Licensee')
const queueServer = require('@config/queue')

describe('transformChatBody', () => {
  const queueServerAddJobSpy = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('enqueues job to dispatcher action of plugin', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url',
    })

    const body = {
      message: {
        type: 'message',
      },
    }

    await transformChatBody(body, licensee)

    expect(queueServerAddJobSpy).toHaveBeenCalledWith(
      'send-message-to-messenger',
      { body: '', url: 'https://chat.url' },
      expect.objectContaining({ chatDefault: 'jivochat', chatUrl: 'https://chat.url' })
    )
  })

  it('does not enqueue job if the plugin has no action', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url',
    })

    const body = {
      message: {
        type: 'typein',
      },
    }

    await transformChatBody(body, licensee)

    expect(queueServerAddJobSpy).not.toHaveBeenCalled()
  })
})
