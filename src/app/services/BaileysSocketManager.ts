import { logger } from '../helpers/logger'

class BaileysSocketManager {
  private _whatsappSessionRepository: any
  private _sockets: Map<string, { socket: any; licensee: any; session: any }>
  private _pending: Set<string>

  constructor({ whatsappSessionRepository }: Record<string, any> = {}) {
    this._whatsappSessionRepository = whatsappSessionRepository
    this._sockets = new Map()
    this._pending = new Set()
  }

  isConnected(sessionId: any): boolean {
    return this._sockets.has(sessionId.toString())
  }

  isConnectedForLicensee(licenseeId: any, setorId: any = null): boolean {
    for (const [, entry] of this._sockets) {
      if (
        entry.session.licensee.toString() === licenseeId.toString() &&
        String(entry.session.setor ?? null) === String(setorId ?? null)
      ) {
        return true
      }
    }
    return false
  }

  async start(
    session: any,
    licensee: any,
    { onMessage, onReceiptUpdate, onLogout, reconnectDelay }: Record<string, any> = {},
  ): Promise<void> {
    const key = session._id.toString()
    if (this._sockets.has(key) || this._pending.has(key)) return
    this._pending.add(key)

    const {
      default: makeWASocket,
      initAuthCreds,
      BufferJSON,
      fetchLatestBaileysVersion,
      Browsers,
      DisconnectReason,
    } = await import('@whiskeysockets/baileys')

    // Inline buildAuthState logic from Baileys.ts (intentional duplication — service is self-contained)
    const rawCredsData =
      session.creds && Object.keys(session.creds).length > 0
        ? JSON.parse(JSON.stringify(session.creds), BufferJSON.reviver)
        : initAuthCreds()

    const rawKeysData = session.keys ? JSON.parse(JSON.stringify(session.keys), BufferJSON.reviver) : {}

    const state = {
      creds: rawCredsData,
      keys: {
        get: (type: any, ids: any) => {
          const keyMap = rawKeysData[type] ?? {}
          return ids.reduce((acc: any, id: any) => {
            if (keyMap[id] !== undefined) acc[id] = keyMap[id]
            return acc
          }, {})
        },
        set: (data: any) => {
          for (const category of Object.keys(data)) {
            rawKeysData[category] = { ...(rawKeysData[category] ?? {}), ...data[category] }
          }
        },
      },
    }

    const { version } = await fetchLatestBaileysVersion()

    const socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
    })

    const callbacks = { onMessage, onReceiptUpdate, onLogout, reconnectDelay }

    // Inline saveSession logic from Baileys.ts (intentional duplication — service is self-contained)
    socket.ev.on('creds.update', () => {
      const serialized = JSON.parse(JSON.stringify({ creds: state.creds, keys: rawKeysData }, BufferJSON.replacer))
      this._whatsappSessionRepository.update(session._id, serialized).catch((err: any) => {
        logger.error(`BaileysSocketManager: erro ao salvar sessão: ${err.message ?? err}`)
      })
    })

    socket.ev.on('connection.update', ({ connection, lastDisconnect }: any) => {
      if (connection === 'open') {
        this._pending.delete(key)
        this._sockets.set(key, { socket, licensee, session })
        logger.info(`BaileysSocketManager: socket aberto para licensee ${licensee._id}`)
        return
      }

      if (connection === 'close') {
        this._pending.delete(key)
        this._sockets.delete(key)

        const statusCode = lastDisconnect?.error?.output?.statusCode
        const isLoggedOut = statusCode === DisconnectReason.loggedOut

        if (isLoggedOut) {
          this._whatsappSessionRepository.update(session._id, { creds: {}, keys: {} }).catch(() => {})
          logger.warn(`BaileysSocketManager: licensee ${licensee._id} deslogado do WhatsApp`)
          onLogout?.()
        } else {
          this._scheduleReconnect(session, licensee, callbacks, reconnectDelay ?? 2000)
        }
      }
    })

    socket.ev.on('messages.upsert', ({ messages, type }: any) => {
      if (type !== 'notify') return
      for (const msg of messages) {
        if (!msg.key.fromMe) {
          onMessage?.(msg)
        }
      }
    })

    socket.ev.on('messages.update', (updates: any) => {
      for (const update of updates) {
        onReceiptUpdate?.(update)
      }
    })
  }

  stop(sessionId: any): void {
    const key = sessionId.toString()
    const entry = this._sockets.get(key)
    if (!entry) return

    try {
      entry.socket.end()
    } catch {
      // socket may already be closed — guard is intentional
    }

    this._sockets.delete(key)
  }

  _scheduleReconnect(session: any, licensee: any, callbacks: any, delayMs = 2000): void {
    const jitter = Math.random() * 1000
    const nextDelay = Math.min(delayMs * 2, 30000)
    setTimeout(() => {
      this.start(session, licensee, { ...callbacks, reconnectDelay: nextDelay })
    }, delayMs + jitter)
  }
}

export { BaileysSocketManager }
