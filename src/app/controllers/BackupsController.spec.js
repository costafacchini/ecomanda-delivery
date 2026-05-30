import { BackupsController } from './BackupsController.js'

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
  const publishMessage = jest.fn()

  const controller = new BackupsController({ publishMessage })

  return { controller, publishMessage }
}

describe('BackupsController delegation', () => {
  beforeEach(() => {})

  it('publishes backup message and returns status 200 on schedule', () => {
    const { controller, publishMessage } = buildController()
    const req = {}
    const res = buildResponse()

    controller.schedule(req, res)

    expect(publishMessage).toHaveBeenCalledWith({ key: 'backup', body: {} })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Backup agendado' })
  })

  it('publishes clear-backups message and returns status 200 on clear', () => {
    const { controller, publishMessage } = buildController()
    const req = {}
    const res = buildResponse()

    controller.clear(req, res)

    expect(publishMessage).toHaveBeenCalledWith({ key: 'clear-backups', body: {} })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith({ body: 'Limpeza de backups antigos agendados' })
  })
})
