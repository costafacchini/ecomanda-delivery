import { BackupsController } from './BackupsController'

jest.mock('../helpers/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}))

function buildResponse() {
  return {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const queueServer = { addJob: jest.fn().mockResolvedValue(undefined) }

  const controller = new BackupsController({ queueServer })

  return { controller, queueServer }
}

describe('BackupsController delegation', () => {
  beforeEach(() => {})

  it('enqueues backup job and returns status 200 on schedule', async () => {
    const { controller, queueServer } = buildController()
    const req = {}
    const res = buildResponse()

    await controller.schedule(req, res)

    expect(queueServer.addJob).toHaveBeenCalledWith('backup', {})
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Backup agendado' })
  })

  it('enqueues clear-backups job and returns status 200 on clear', async () => {
    const { controller, queueServer } = buildController()
    const req = {}
    const res = buildResponse()

    await controller.clear(req, res)

    expect(queueServer.addJob).toHaveBeenCalledWith('clear-backups', {})
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Limpeza de backups antigos agendados' })
  })
})
