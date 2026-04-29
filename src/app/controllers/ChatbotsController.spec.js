import { ChatbotsController } from './ChatbotsController.js'

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const bodyRepository = { create: jest.fn() }
  const queueServer = { addJob: jest.fn() }
  const publishMessage = jest.fn()

  const controller = new ChatbotsController({ bodyRepository, queueServer, publishMessage })

  return { controller, bodyRepository, queueServer, publishMessage }
}

describe('ChatbotsController delegation', () => {
  it('creates body, enqueues chatbot-message job and returns status 200 on message', async () => {
    const { controller, bodyRepository, queueServer } = buildController()
    const body = { _id: 'body-id', licensee: 'licensee-id' }
    bodyRepository.create.mockResolvedValue(body)
    queueServer.addJob.mockResolvedValue()

    const req = { body: { field: 'test' }, licensee: { _id: 'licensee-id' } }
    const res = buildResponse()

    jest.spyOn(global.console, 'info').mockImplementation()

    await controller.message(req, res)

    expect(bodyRepository.create).toHaveBeenCalledWith({ content: req.body, licensee: 'licensee-id', kind: 'normal' })
    expect(queueServer.addJob).toHaveBeenCalledWith('chatbot-message', { bodyId: 'body-id', licenseeId: 'licensee-id' })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Solicitação de mensagem para a plataforma de chatbot agendado' })
  })

  it('creates body, enqueues chatbot-transfer-to-chat job and returns status 200 on transfer', async () => {
    const { controller, bodyRepository, queueServer } = buildController()
    const body = { _id: 'body-id', licensee: 'licensee-id' }
    bodyRepository.create.mockResolvedValue(body)
    queueServer.addJob.mockResolvedValue()

    const req = { body: { field: 'alter' }, licensee: { _id: 'licensee-id' } }
    const res = buildResponse()

    jest.spyOn(global.console, 'info').mockImplementation()

    await controller.transfer(req, res)

    expect(bodyRepository.create).toHaveBeenCalledWith({ content: req.body, licensee: 'licensee-id', kind: 'normal' })
    expect(queueServer.addJob).toHaveBeenCalledWith('chatbot-transfer-to-chat', {
      bodyId: 'body-id',
      licenseeId: 'licensee-id',
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      body: 'Solicitação de transferência do chatbot para a plataforma de chat agendado',
    })
  })

  it('publishes reset-chatbots and returns status 200 on reset', () => {
    const { controller, publishMessage } = buildController()
    const req = {}
    const res = buildResponse()

    jest.spyOn(global.console, 'info').mockImplementation()

    controller.reset(req, res)

    expect(publishMessage).toHaveBeenCalledWith({ key: 'reset-chatbots', body: {} })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Solicitação para resetar os chatbots abandonados agendado' })
  })
})
