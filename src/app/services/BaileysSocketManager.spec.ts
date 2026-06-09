import { BaileysSocketManager } from './BaileysSocketManager'

jest.mock('../helpers/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(), fatal: jest.fn() },
}))

// Capture event handlers registered on the socket so tests can trigger them
const socketEventHandlers: Record<string, ((...args: any[]) => void)[]> = {}

const mockSocketEnd = jest.fn()
const mockSocketEvOn = jest.fn((event: string, callback: (...args: any[]) => void) => {
  if (!socketEventHandlers[event]) {
    socketEventHandlers[event] = []
  }
  socketEventHandlers[event].push(callback)
})

const mockMakeWASocket = jest.fn(() => ({
  end: mockSocketEnd,
  ev: { on: mockSocketEvOn },
}))

const LOGGED_OUT_STATUS = 401

jest.mock('@whiskeysockets/baileys', () => ({
  __esModule: true,
  default: (...args: any[]) => mockMakeWASocket(...args),
  initAuthCreds: () => ({ noiseKey: {}, signedIdentityKey: {}, signedPreKey: {}, registrationId: 0, advSecretKey: '' }),
  BufferJSON: { replacer: (_: any, val: any) => val, reviver: (_: any, val: any) => val },
  Browsers: { ubuntu: () => ['Ubuntu', 'Chrome', '22.04.4'] },
  fetchLatestBaileysVersion: jest.fn().mockResolvedValue({ version: [2, 3000, 0] }),
  DisconnectReason: { loggedOut: LOGGED_OUT_STATUS },
}))

function makeSession(overrides: Record<string, any> = {}) {
  return { _id: 'session-id-1', licensee: 'licensee-id-1', setor: null, creds: {}, keys: {}, ...overrides }
}

function makeLicensee(overrides: Record<string, any> = {}) {
  return { _id: { toString: () => 'licensee-id-1' }, ...overrides }
}

function makeRepository(session: ReturnType<typeof makeSession>) {
  return {
    findFirst: jest.fn().mockResolvedValue(session),
    create: jest.fn().mockResolvedValue(session),
    update: jest.fn().mockResolvedValue(session),
  }
}

function fireEvent(event: string, payload: any) {
  const handlers = socketEventHandlers[event] ?? []
  for (const handler of handlers) {
    handler(payload)
  }
}

describe('BaileysSocketManager', () => {
  let manager: BaileysSocketManager
  let repo: ReturnType<typeof makeRepository>
  let licensee: ReturnType<typeof makeLicensee>
  let session: ReturnType<typeof makeSession>

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    for (const key of Object.keys(socketEventHandlers)) {
      delete socketEventHandlers[key]
    }

    session = makeSession()
    repo = makeRepository(session)
    licensee = makeLicensee()
    manager = new BaileysSocketManager({ whatsappSessionRepository: repo })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('messages.upsert', () => {
    it('calls onMessage when type is notify and fromMe is false', async () => {
      const onMessage = jest.fn()
      await manager.start(session, licensee, { onMessage })

      const msg = {
        key: { fromMe: false, remoteJid: '5511@s.whatsapp.net', id: 'msg-1' },
        message: { conversation: 'hello' },
      }
      fireEvent('messages.upsert', { messages: [msg], type: 'notify' })

      expect(onMessage).toHaveBeenCalledWith(msg)
    })

    it('does NOT call onMessage when fromMe is true', async () => {
      const onMessage = jest.fn()
      await manager.start(session, licensee, { onMessage })

      const msg = {
        key: { fromMe: true, remoteJid: '5511@s.whatsapp.net', id: 'msg-2' },
        message: { conversation: 'sent by me' },
      }
      fireEvent('messages.upsert', { messages: [msg], type: 'notify' })

      expect(onMessage).not.toHaveBeenCalled()
    })

    it('does NOT call onMessage when type is not notify', async () => {
      const onMessage = jest.fn()
      await manager.start(session, licensee, { onMessage })

      const msg = {
        key: { fromMe: false, remoteJid: '5511@s.whatsapp.net', id: 'msg-3' },
        message: { conversation: 'hi' },
      }
      fireEvent('messages.upsert', { messages: [msg], type: 'append' })

      expect(onMessage).not.toHaveBeenCalled()
    })
  })

  describe('messages.update', () => {
    it('calls onReceiptUpdate for each update', async () => {
      const onReceiptUpdate = jest.fn()
      await manager.start(session, licensee, { onReceiptUpdate })

      const updates = [
        { key: { id: 'msg-1' }, update: { status: 2 } },
        { key: { id: 'msg-2' }, update: { status: 3 } },
      ]
      fireEvent('messages.update', updates)

      expect(onReceiptUpdate).toHaveBeenCalledTimes(2)
      expect(onReceiptUpdate).toHaveBeenNthCalledWith(1, updates[0])
      expect(onReceiptUpdate).toHaveBeenNthCalledWith(2, updates[1])
    })
  })

  describe('connection.update', () => {
    it('schedules reconnect on non-logout close error', async () => {
      const scheduleReconnectSpy = jest.spyOn(manager, '_scheduleReconnect')
      await manager.start(session, licensee, { reconnectDelay: 2000 })

      const disconnectError = { output: { statusCode: 500 } }
      fireEvent('connection.update', { connection: 'close', lastDisconnect: { error: disconnectError } })

      expect(scheduleReconnectSpy).toHaveBeenCalledWith(
        session,
        licensee,
        expect.objectContaining({ reconnectDelay: 2000 }),
        2000,
      )
    })

    it('clears creds and calls onLogout on loggedOut (401) disconnect', async () => {
      const onLogout = jest.fn()
      await manager.start(session, licensee, { onLogout })

      const loggedOutError = { output: { statusCode: LOGGED_OUT_STATUS } }
      fireEvent('connection.update', { connection: 'close', lastDisconnect: { error: loggedOutError } })

      expect(repo.update).toHaveBeenCalledWith(session._id, { creds: {}, keys: {} })
      expect(onLogout).toHaveBeenCalled()
    })

    it('stores socket in registry when connection opens', async () => {
      await manager.start(session, licensee, {})

      expect(manager.isConnected(session._id)).toBe(false)
      fireEvent('connection.update', { connection: 'open' })
      expect(manager.isConnected(session._id)).toBe(true)
    })

    it('removes socket from registry when connection closes', async () => {
      await manager.start(session, licensee, {})

      fireEvent('connection.update', { connection: 'open' })
      expect(manager.isConnected(session._id)).toBe(true)

      fireEvent('connection.update', {
        connection: 'close',
        lastDisconnect: { error: { output: { statusCode: 500 } } },
      })
      expect(manager.isConnected(session._id)).toBe(false)
    })
  })

  describe('stop()', () => {
    it('calls socket.end() and removes from registry', async () => {
      await manager.start(session, licensee, {})
      fireEvent('connection.update', { connection: 'open' })
      expect(manager.isConnected(session._id)).toBe(true)

      manager.stop(session._id)

      expect(mockSocketEnd).toHaveBeenCalled()
      expect(manager.isConnected(session._id)).toBe(false)
    })

    it('is a no-op when no socket is registered', () => {
      expect(() => manager.stop('unknown-session-id')).not.toThrow()
      expect(mockSocketEnd).not.toHaveBeenCalled()
    })
  })

  describe('isConnected()', () => {
    it('returns false when socket is not in registry', () => {
      expect(manager.isConnected(session._id)).toBe(false)
    })

    it('returns true only when socket is in registry', async () => {
      await manager.start(session, licensee, {})
      fireEvent('connection.update', { connection: 'open' })
      expect(manager.isConnected(session._id)).toBe(true)
    })
  })

  describe('isConnectedForLicensee()', () => {
    it('returns false when no socket is registered', () => {
      expect(manager.isConnectedForLicensee('licensee-id-1', null)).toBe(false)
    })

    it('returns true for the main session (setor=null) after connection opens', async () => {
      await manager.start(session, licensee, {})
      fireEvent('connection.update', { connection: 'open' })

      expect(manager.isConnectedForLicensee('licensee-id-1', null)).toBe(true)
    })

    it('returns true for a sector session after connection opens', async () => {
      const setorId = 'setor-id-abc'
      const sectorSession = makeSession({ _id: 'session-id-2', setor: setorId })
      await manager.start(sectorSession, licensee, {})
      fireEvent('connection.update', { connection: 'open' })

      expect(manager.isConnectedForLicensee('licensee-id-1', setorId)).toBe(true)
    })

    it('does not confuse main session with sector session', async () => {
      const setorId = 'setor-id-abc'
      // Only main session connected
      await manager.start(session, licensee, {})
      fireEvent('connection.update', { connection: 'open' })

      expect(manager.isConnectedForLicensee('licensee-id-1', null)).toBe(true)
      expect(manager.isConnectedForLicensee('licensee-id-1', setorId)).toBe(false)
    })

    it('stores two sessions for the same licensee under different keys', async () => {
      const setorId = 'setor-id-abc'
      const sectorSession = makeSession({ _id: 'session-id-2', setor: setorId })

      await manager.start(session, licensee, {})
      // Clear handlers before starting second session so events go to correct handlers
      for (const key of Object.keys(socketEventHandlers)) {
        delete socketEventHandlers[key]
      }
      await manager.start(sectorSession, licensee, {})
      fireEvent('connection.update', { connection: 'open' })

      // The second session is now open; first was opened in previous call
      // Verify both are tracked independently
      expect(manager.isConnected(session._id)).toBe(false) // not yet opened (handler cleared)
      expect(manager.isConnected(sectorSession._id)).toBe(true)
    })
  })
})
