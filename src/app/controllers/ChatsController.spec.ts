import { ChatsController } from './ChatsController'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const ingestChatMessage = {
    execute: jest.fn(),
  }
  const queueServer = { addJob: jest.fn().mockResolvedValue(undefined) }

  const controller = new ChatsController({ ingestChatMessage, queueServer })

  return { controller, ingestChatMessage, queueServer }
}

describe('ChatsController delegation', () => {
  it('delegates message to ingestChatMessage use case and returns status 200', async () => {
    const { controller, ingestChatMessage } = buildController()
    const req = {
      body: { field: 'test' },
      licensee: { _id: 'licensee-id' },
    }
    const res = buildResponse()

    ingestChatMessage.execute.mockResolvedValue({})

    await controller.message(req, res)

    expect(ingestChatMessage.execute).toHaveBeenCalledWith({
      body: req.body,
      licenseeId: 'licensee-id',
      inboxId: null,
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  })

  it('forwards inboxId from req.inbox when inbox is present', async () => {
    const { controller, ingestChatMessage } = buildController()
    const req = {
      body: { field: 'test' },
      licensee: { _id: 'licensee-id' },
      inbox: { _id: 'inbox-id' },
    }
    const res = buildResponse()

    ingestChatMessage.execute.mockResolvedValue({})

    await controller.message(req, res)

    expect(ingestChatMessage.execute).toHaveBeenCalledWith({
      body: req.body,
      licenseeId: 'licensee-id',
      inboxId: 'inbox-id',
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('enqueues reset-chats job and returns status 200 on reset', async () => {
    const { controller, queueServer } = buildController()
    const req = {}
    const res = buildResponse()

    await controller.reset(req, res)

    expect(queueServer.addJob).toHaveBeenCalledWith('reset-chats', {})
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso',
    })
  })
})
