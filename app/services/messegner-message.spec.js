const transformMessengerBody = require('./messenger-message')
const Licensee = require('@models/licensee')
const { queue } = require('@config/queue-server')

describe('transformMessengerBody', () => {
  const mockFunction = jest.spyOn(queue, 'addJobDispatcher')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('enqueues job to dispatcher action of plugin', () => {
    const licensee = new Licensee({
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://whatsapp.url',
      whatsappToken: 'ljsdf12g'
    })

    const body = {
      message: {
        type: 'message'
      }
    }

    transformMessengerBody(body, licensee)

    expect(mockFunction).toHaveBeenCalledWith(
      'send-message-to-chat',
      { body: '', url: 'https://whatsapp.url', token: 'ljsdf12g' },
      expect.objectContaining({ whatsappDefault: 'chatapi', whatsappUrl: 'https://whatsapp.url', whatsappToken: 'ljsdf12g' })
    )
  })
})