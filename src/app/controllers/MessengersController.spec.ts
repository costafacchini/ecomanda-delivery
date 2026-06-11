import { MessengersController } from './MessengersController'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const ingestMessengerMessage = {
    execute: jest.fn(),
  }

  const controller = new MessengersController({ ingestMessengerMessage })

  return { controller, ingestMessengerMessage }
}

describe('MessengersController delegation', () => {
  it('delegates message to ingestMessengerMessage use case and returns status 200', async () => {
    const { controller, ingestMessengerMessage } = buildController()
    const req = {
      body: { field: 'test' },
      licensee: { _id: 'licensee-id' },
    }
    const res = buildResponse()

    ingestMessengerMessage.execute.mockResolvedValue({})

    await controller.message(req, res)

    expect(ingestMessengerMessage.execute).toHaveBeenCalledWith({
      body: req.body,
      licenseeId: 'licensee-id',
      sectorId: null,
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Solicitação de mensagem para a plataforma de messenger agendado' })
  })

  it('forwards sectorId from req.sector when sector is present', async () => {
    const { controller, ingestMessengerMessage } = buildController()
    const req = {
      body: { field: 'test' },
      licensee: { _id: 'licensee-id' },
      sector: { _id: 'sector-id' },
    }
    const res = buildResponse()

    ingestMessengerMessage.execute.mockResolvedValue({})

    await controller.message(req, res)

    expect(ingestMessengerMessage.execute).toHaveBeenCalledWith({
      body: req.body,
      licenseeId: 'licensee-id',
      sectorId: 'sector-id',
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
