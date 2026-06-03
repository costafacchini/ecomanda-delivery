import { logger } from '../helpers/logger'

class BaileysSocketManager {
  private _whatsappSessionRepository: any
  private _sockets: Map<string, { socket: any; licensee: any }>

  constructor({ whatsappSessionRepository }: Record<string, any> = {}) {
    this._whatsappSessionRepository = whatsappSessionRepository
    this._sockets = new Map()
  }

  isConnected(licenseeId: any): boolean {
    return this._sockets.has(licenseeId.toString())
  }

  async start(
    licensee: any,
    { onMessage, onReceiptUpdate, onLogout, reconnectDelay }: Record<string, any> = {},
  ): Promise<void> {
    // Load or create session for this licensee
    let session = await this._whatsappSessionRepository.findFirst({ licensee: licensee._id })
    if (!session) {
      session = await this._whatsappSessionRepository.create({ licensee: licensee._id })
    }

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
        this._sockets.set(licensee._id.toString(), { socket, licensee })
        logger.info(`BaileysSocketManager: socket aberto para licensee ${licensee._id}`)
        return
      }

      if (connection === 'close') {
        this._sockets.delete(licensee._id.toString())

        const statusCode = lastDisconnect?.error?.output?.statusCode
        const isLoggedOut = statusCode === DisconnectReason.loggedOut

        if (isLoggedOut) {
          this._whatsappSessionRepository.update(session._id, { creds: {}, keys: {} }).catch(() => {})
          logger.warn(`BaileysSocketManager: licensee ${licensee._id} deslogado do WhatsApp`)
          onLogout?.()
        } else {
          this._scheduleReconnect(licensee, callbacks, reconnectDelay ?? 2000)
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

  stop(licenseeId: any): void {
    const key = licenseeId.toString()
    const entry = this._sockets.get(key)
    if (!entry) return

    try {
      entry.socket.end()
    } catch {
      // socket may already be closed — guard is intentional
    }

    this._sockets.delete(key)
  }

  _scheduleReconnect(licensee: any, callbacks: any, delayMs = 2000): void {
    const jitter = Math.random() * 1000
    const nextDelay = Math.min(delayMs * 2, 30000)
    setTimeout(() => {
      this.start(licensee, { ...callbacks, reconnectDelay: nextDelay })
    }, delayMs + jitter)
  }
}

export { BaileysSocketManager }
