const transformChatBody = require('./chat-message')
const Licensee = require('@models/licensee')
const queueServer = require('@config/queue')

describe('transformChatBody', () => {
  const mockFunction = jest.spyOn(queueServer, 'addJob')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('enqueues job to dispatcher action of plugin', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url'
    })

    const body = {
      message: {
        type: 'message'
      }
    }

    await transformChatBody(body, licensee)

    expect(mockFunction).toHaveBeenCalledWith(
      'send-message-to-messenger',
      { body: '', url: 'https://chat.url' },
      expect.objectContaining({ chatDefault: 'jivochat', chatUrl: 'https://chat.url' })
    )
  })

  it('does not enqueue job if the plugin has no action', async () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url'
    })

    const body = {
      message: {
        type: 'typein'
      }
    }

    await transformChatBody(body, licensee)

    expect(mockFunction).not.toHaveBeenCalled()
  })
})
