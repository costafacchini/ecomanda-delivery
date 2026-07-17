jest.mock('../../helpers/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}))

import { logger } from '../../helpers/logger'
import { StartBaileysSocket } from './StartBaileysSocket'

function makeSession(overrides: Record<string, any> = {}) {
  return { _id: 'session-id-1', licensee: 'licensee-id-123', department: null, ...overrides }
}

function buildUseCase(overrides: Record<string, any> = {}) {
  const session = overrides.session ?? makeSession()
  const whatsappSessionRepository = overrides.whatsappSessionRepository ?? {
    findFirst: jest.fn().mockResolvedValue(session),
    create: jest.fn().mockResolvedValue(session),
  }
  const socketManager = overrides.socketManager ?? { start: jest.fn().mockResolvedValue(undefined) }
  const plugin = { responseToMessages: jest.fn().mockResolvedValue(undefined) }
  const createMessengerPlugin = jest.fn().mockReturnValue(plugin)
  const ingestMessengerMessage = { execute: jest.fn().mockResolvedValue(undefined) }
  const useCase = new StartBaileysSocket({
    socketManager,
    whatsappSessionRepository,
    createMessengerPlugin,
    ingestMessengerMessage,
  })
  return {
    useCase,
    socketManager,
    plugin,
    createMessengerPlugin,
    ingestMessengerMessage,
    whatsappSessionRepository,
    session,
  }
}

describe('StartBaileysSocket', () => {
  const licensee = { _id: 'licensee-id-123' }

  it('calls socketManager.start with the session and licensee', async () => {
    const { useCase, socketManager, session } = buildUseCase()

    await useCase.execute(licensee)

    expect(socketManager.start).toHaveBeenCalledWith(session, licensee, expect.any(Object))
  })

  it('looks up the session by licensee._id and department=null when no department given', async () => {
    const { useCase, whatsappSessionRepository } = buildUseCase()

    await useCase.execute(licensee)

    expect(whatsappSessionRepository.findFirst).toHaveBeenCalledWith({ licensee: licensee._id, department: null })
  })

  it('looks up the session by licensee._id and department._id when department is given', async () => {
    const department = { _id: 'department-id-abc' }
    const departmentSession = makeSession({ _id: 'session-id-2', department: department._id })
    const { useCase, whatsappSessionRepository } = buildUseCase({
      whatsappSessionRepository: {
        findFirst: jest.fn().mockResolvedValue(departmentSession),
        create: jest.fn().mockResolvedValue(departmentSession),
      },
    })

    await useCase.execute(licensee, department)

    expect(whatsappSessionRepository.findFirst).toHaveBeenCalledWith({ licensee: licensee._id, department: department._id })
  })

  it('creates a new session when none is found', async () => {
    const session = makeSession()
    const whatsappSessionRepository = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(session),
    }
    const { useCase, socketManager } = buildUseCase({ whatsappSessionRepository, session })

    await useCase.execute(licensee)

    expect(whatsappSessionRepository.create).toHaveBeenCalledWith({ licensee: licensee._id, department: null })
    expect(socketManager.start).toHaveBeenCalledWith(session, licensee, expect.any(Object))
  })

  it('passes departmentId in ingestMessengerMessage.execute when department is provided', async () => {
    const department = { _id: 'department-id-abc' }
    const departmentSession = makeSession({ _id: 'session-id-2', department: department._id })
    const whatsappSessionRepository = {
      findFirst: jest.fn().mockResolvedValue(departmentSession),
      create: jest.fn().mockResolvedValue(departmentSession),
    }
    const socketManager = { start: jest.fn().mockResolvedValue(undefined) }
    const ingestMessengerMessage = { execute: jest.fn().mockResolvedValue(undefined) }
    const plugin = { responseToMessages: jest.fn() }
    const createMessengerPlugin = jest.fn().mockReturnValue(plugin)
    const useCase = new StartBaileysSocket({
      socketManager,
      whatsappSessionRepository,
      createMessengerPlugin,
      ingestMessengerMessage,
    })

    await useCase.execute(licensee, department)

    const { onMessage } = socketManager.start.mock.calls[0][2]
    const msg = { key: { id: 'msg-1' }, message: { conversation: 'hello' } }
    await onMessage(msg)

    expect(ingestMessengerMessage.execute).toHaveBeenCalledWith({
      body: msg,
      licenseeId: licensee._id,
      departmentId: department._id,
    })
  })

  it('onMessage callback calls ingestMessengerMessage.execute with body and licenseeId', async () => {
    const { useCase, socketManager, ingestMessengerMessage } = buildUseCase()

    await useCase.execute(licensee)

    const { onMessage } = socketManager.start.mock.calls[0][2]
    const msg = { key: { id: 'msg-1' }, message: { conversation: 'hello' } }

    await onMessage(msg)

    expect(ingestMessengerMessage.execute).toHaveBeenCalledWith({
      body: msg,
      licenseeId: licensee._id,
      departmentId: null,
    })
  })

  it('onReceiptUpdate callback calls plugin.responseToMessages with the update', async () => {
    const { useCase, socketManager, plugin } = buildUseCase()

    await useCase.execute(licensee)

    const { onReceiptUpdate } = socketManager.start.mock.calls[0][2]
    const update = { key: { id: 'msg-1' }, status: 2 }

    await onReceiptUpdate(update)

    expect(plugin.responseToMessages).toHaveBeenCalledWith(update)
  })

  it('onLogout callback logs a warning with the licensee id', async () => {
    const { useCase, socketManager } = buildUseCase()

    await useCase.execute(licensee)

    const { onLogout } = socketManager.start.mock.calls[0][2]
    onLogout()

    expect(logger.warn).toHaveBeenCalledWith(`Baileys: sessão do licensee ${licensee._id} foi desconectada (logout).`)
  })
})
