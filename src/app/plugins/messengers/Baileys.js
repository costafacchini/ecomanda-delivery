import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import { MessengersBase } from './Base.js'
import { requireDependency } from '../../helpers/RequireDependency.js'

class Baileys extends MessengersBase {
  constructor(licensee, { whatsappSessionRepository, ...dependencies } = {}) {
    super(licensee, dependencies)
    this._whatsappSessionRepository = whatsappSessionRepository
  }

  get whatsappSessionRepository() {
    return requireDependency(this._whatsappSessionRepository, 'whatsappSessionRepository', this.constructor.name)
  }

  action(messageDestination) {
    if (messageDestination === 'to-chat') {
      return 'send-message-to-chat'
    } else if (messageDestination === 'to-messenger') {
      return 'send-message-to-messenger'
    } else {
      return 'send-message-to-chatbot'
    }
  }

  parseMessageStatus(_body) {
    // Baileys delivery receipts are not received via HTTP webhook body in the same shape.
    // For now, no status parsing is needed from incoming HTTP payloads.
    this.messageStatus = null
  }

  parseMessage(body) {
    if (!body || !body.key) {
      this.messageData = null
      return
    }

    const text = body.message?.conversation || body.message?.extendedTextMessage?.text || null

    if (!text) {
      // Non-text message types (sticker, image, audio, etc.) — not handled in initial scope
      this.messageData = null
      return
    }

    this.messageData = {
      kind: 'text',
      waId: body.key.id,
      text: { body: text },
    }
  }

  parseContactData(body) {
    if (!body || !body.key) {
      this.contactData = null
      return
    }

    const remoteJid = body.key.remoteJid
    const phone = remoteJid.replace(/@s\.whatsapp\.net$/, '').replace(/@g\.us$/, '')
    const normalizePhone = new NormalizePhone(phone)

    this.contactData = {
      number: normalizePhone.number,
      type: normalizePhone.type,
      waId: remoteJid.replace(/@s\.whatsapp\.net$/, '').replace(/@g\.us$/, ''),
      name: body.pushName || normalizePhone.number,
      wa_start_chat: new Date(),
    }
  }

  contactWithDifferentData(contact) {
    return (
      (this.contactData.name && this.contactData.name !== contact.name) ||
      (this.contactData.waId && this.contactData.waId !== contact.waId)
    )
  }

  shouldUpdateWaStartChat(contact) {
    return !contact.wa_start_chat
  }

  async loadOrCreateSession() {
    let session = await this.whatsappSessionRepository.findFirst({ licensee: this.licensee._id })
    if (!session) {
      session = await this.whatsappSessionRepository.create({ licensee: this.licensee._id })
    }
    return session
  }

  async saveSession(session, creds, keys) {
    await this.whatsappSessionRepository.update(session._id, { creds, keys })
  }

  buildAuthState(session) {
    const creds = session.creds ?? {}
    const keys = session.keys ?? {}

    return {
      state: {
        creds,
        keys: {
          get: (type, ids) => {
            const keyMap = keys[type] ?? {}
            return ids.reduce((acc, id) => {
              if (keyMap[id] !== undefined) acc[id] = keyMap[id]
              return acc
            }, {})
          },
          set: (data) => {
            for (const category of Object.keys(data)) {
              keys[category] = { ...(keys[category] ?? {}), ...data[category] }
            }
          },
        },
      },
      rawKeys: keys,
    }
  }

  async sendMessage(messageId) {
    const { default: makeWASocket } = await import('@whiskeysockets/baileys')

    const messageToSend = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])

    if (!messageToSend) {
      console.error(`Baileys: mensagem ${messageId} não encontrada.`)
      return
    }

    if (messageToSend.kind !== 'text') {
      console.warn(
        `Baileys: tipo de mensagem '${messageToSend.kind}' não suportado no escopo inicial. Mensagem ${messageId} ignorada.`,
      )
      return
    }

    const session = await this.loadOrCreateSession()
    const { state, rawKeys } = this.buildAuthState(session)

    let socket
    try {
      socket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['ecomanda', 'Chrome', '1.0.0'],
      })

      socket.ev.on('creds.update', () => {
        this.saveSession(session, state.creds, rawKeys).catch((err) => {
          console.error(`Baileys: erro ao salvar sessão: ${err.message ?? err}`)
        })
      })

      const jid = `${messageToSend.contact.waId || messageToSend.contact.number}@s.whatsapp.net`
      const result = await socket.sendMessage(jid, { text: messageToSend.text })

      messageToSend.messageWaId = result?.key?.id ?? null
      messageToSend.sended = true
      await this.messageRepository.save(messageToSend)
      console.info(`Mensagem ${messageId} enviada via Baileys com sucesso!`)
    } catch (error) {
      messageToSend.error = error.message ?? String(error)
      await this.messageRepository.save(messageToSend)
      console.error(`Mensagem ${messageId} não enviada via Baileys. Erro: ${error.message ?? error}`)
    } finally {
      if (socket) {
        socket.end()
      }
    }
  }

  getQrCode(timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      this.loadOrCreateSession()
        .then((session) => {
          const { state, rawKeys } = this.buildAuthState(session)

          let socket
          const timer = setTimeout(() => {
            if (socket) socket.end()
            reject(new Error('Timeout ao gerar QR Code'))
          }, timeoutMs)

          import('@whiskeysockets/baileys')
            .then(({ default: makeWASocket }) => {
              socket = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                browser: ['ecomanda', 'Chrome', '1.0.0'],
              })

              socket.ev.on('connection.update', (update) => {
                const { qr, connection } = update

                if (qr) {
                  clearTimeout(timer)
                  socket.end()
                  resolve(qr)
                  return
                }

                if (connection === 'open') {
                  clearTimeout(timer)
                  socket.end()
                  resolve(null)
                }
              })

              socket.ev.on('creds.update', () => {
                this.saveSession(session, state.creds, rawKeys).catch((err) => {
                  console.error(`Baileys: erro ao salvar sessão: ${err.message ?? err}`)
                })
              })
            })
            .catch((err) => {
              clearTimeout(timer)
              reject(err)
            })
        })
        .catch(reject)
    })
  }
}

export { Baileys }
