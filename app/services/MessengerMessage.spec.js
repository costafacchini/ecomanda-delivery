const transformMessengerBody = require('./MessengerMessage')
const Licensee = require('@models/Licensee')
const queueServer = require('@config/queue')

describe('transformMessengerBody', () => {
  const mockFunction = jest.spyOn(queueServer, 'addJob')

  afterEach(() => {
    mockFunction.mockRestore()
  })

  it('enqueues job to dispatcher action of plugin', async () => {
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

    await transformMessengerBody(body, licensee)

    expect(mockFunction).toHaveBeenCalledWith(
      'send-message-to-chat',
      { body: '', url: 'https://whatsapp.url', token: 'ljsdf12g' },
      expect.objectContaining({ whatsappDefault: 'chatapi', whatsappUrl: 'https://whatsapp.url', whatsappToken: 'ljsdf12g' })
    )
  })
})
