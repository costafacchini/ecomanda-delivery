import { ChatsController } from './ChatsController.js'

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
  const publishMessageMock = jest.fn()

  const controller = new ChatsController({ ingestChatMessage, publishMessage: publishMessageMock })

  return { controller, ingestChatMessage, publishMessage: publishMessageMock }
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

    expect(ingestChatMessage.execute).toHaveBeenCalledWith({ body: req.body, licenseeId: 'licensee-id' })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Solicitação de mensagem para a plataforma de chat agendado' })
  })

  it('publishes reset-chats message and returns status 200 on reset', () => {
    const { controller, publishMessage: publishMessageMock } = buildController()
    const req = {}
    const res = buildResponse()

    controller.reset(req, res)

    expect(publishMessageMock).toHaveBeenCalledWith({ key: 'reset-chats', body: {} })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({
      body: 'Solicitação para avisar os chats com janela vencendo agendado com sucesso',
    })
  })
})
