const transformMessengerBody = require('./MessengerMessage')
const Licensee = require('@models/Licensee')
const queueServer = require('@config/queue')

describe('transformMessengerBody', () => {
  const queueServerAddJob = jest.spyOn(queueServer, 'addJob').mockImplementation(() => Promise.resolve())

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('enqueues job to dispatcher action of plugin', async () => {
    const licensee = new Licensee({
      whatsappDefault: 'chatapi',
      whatsappUrl: 'https://whatsapp.url',
      whatsappToken: 'ljsdf12g',
    })

    const body = {
      message: {
        type: 'message',
      },
    }

    await transformMessengerBody(body, licensee)

    expect(queueServerAddJob).toHaveBeenCalledWith(
      'send-message-to-chat',
      { body: '', url: 'https://whatsapp.url', token: 'ljsdf12g' },
      expect.objectContaining({
        whatsappDefault: 'chatapi',
        whatsappUrl: 'https://whatsapp.url',
        whatsappToken: 'ljsdf12g',
      })
    )
  })
})
