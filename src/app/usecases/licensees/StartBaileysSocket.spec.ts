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

function buildUseCase() {
  const socketManager = { start: jest.fn().mockResolvedValue(undefined) }
  const plugin = { responseToMessages: jest.fn().mockResolvedValue(undefined) }
  const createMessengerPlugin = jest.fn().mockReturnValue(plugin)
  const ingestMessengerMessage = { execute: jest.fn().mockResolvedValue(undefined) }
  const useCase = new StartBaileysSocket({ socketManager, createMessengerPlugin, ingestMessengerMessage })
  return { useCase, socketManager, plugin, createMessengerPlugin, ingestMessengerMessage }
}

describe('StartBaileysSocket', () => {
  const licensee = { _id: 'licensee-id-123' }

  it('calls socketManager.start with the licensee', async () => {
    const { useCase, socketManager } = buildUseCase()

    await useCase.execute(licensee)

    expect(socketManager.start).toHaveBeenCalledWith(licensee, expect.any(Object))
  })

  it('onMessage callback calls ingestMessengerMessage.execute with body and licenseeId', async () => {
    const { useCase, socketManager, ingestMessengerMessage } = buildUseCase()

    await useCase.execute(licensee)

    const { onMessage } = socketManager.start.mock.calls[0][1]
    const msg = { key: { id: 'msg-1' }, message: { conversation: 'hello' } }

    await onMessage(msg)

    expect(ingestMessengerMessage.execute).toHaveBeenCalledWith({
      body: msg,
      licenseeId: licensee._id,
    })
  })

  it('onReceiptUpdate callback calls plugin.responseToMessages with the update', async () => {
    const { useCase, socketManager, plugin } = buildUseCase()

    await useCase.execute(licensee)

    const { onReceiptUpdate } = socketManager.start.mock.calls[0][1]
    const update = { key: { id: 'msg-1' }, status: 2 }

    await onReceiptUpdate(update)

    expect(plugin.responseToMessages).toHaveBeenCalledWith(update)
  })

  it('onLogout callback logs a warning with the licensee id', async () => {
    const { useCase, socketManager } = buildUseCase()

    await useCase.execute(licensee)

    const { onLogout } = socketManager.start.mock.calls[0][1]
    onLogout()

    expect(logger.warn).toHaveBeenCalledWith(`Baileys: sessão do licensee ${licensee._id} foi desconectada (logout).`)
  })
})
