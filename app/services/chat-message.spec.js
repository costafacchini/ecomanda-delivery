const transformChatBody = require('./chat-message')
const Licensee = require('@models/licensee')
const { queue } = require('@config/queue-server')

describe('transformChatBody', () => {
  const mockFunction = jest.spyOn(queue, 'addJobDispatcher')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('enqueues job to dispatcher action of plugin', () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url'
    })

    const body = {
      message: {
        type: 'message'
      }
    }

    transformChatBody(body, licensee)

    expect(mockFunction).toHaveBeenCalledWith(
      'send-message',
      { body: '', url: 'https://chat.url' },
      expect.objectContaining({ chatDefault: 'jivochat', chatUrl: 'https://chat.url' })
    )
  })

  it('does not enqueue job if the plugin has no action', () => {
    const licensee = new Licensee({
      chatDefault: 'jivochat',
      chatUrl: 'https://chat.url'
    })

    const body = {
      message: {
        type: 'typein'
      }
    }

    transformChatBody(body, licensee)

    expect(mockFunction).not.toHaveBeenCalled()
  })
})