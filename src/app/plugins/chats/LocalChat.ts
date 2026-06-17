import { ChatsBase } from './Base'
import { emitToLicensee } from '../../services/socketEmitter'

class LocalChat extends ChatsBase {
  _roomRepository: any

  constructor(licensee: any, { roomRepository, ...dependencies }: Record<string, any> = {}) {
    super(licensee, dependencies)
    this._roomRepository = roomRepository
  }

  action(_responseBody?: any) {
    return 'send-message-to-messenger'
  }

  async sendMessage(messageId: any) {
    const message = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])
    if (!message) return

    let room = await this._roomRepository.findOpenForContact(message.contact._id)
    if (!room) {
      room = await this._roomRepository.create({
        contact: message.contact._id,
        status: 'pending',
        sector: message.sector ?? null,
      })
    }

    message.sended = true
    await this.messageRepository.save(message)

    emitToLicensee(this.licensee._id, 'new-room-message', {
      roomId: room._id,
      messageId: message._id,
      licenseeId: this.licensee._id,
    })
  }

  async parseMessage(body: any) {
    if (!body?.roomId || !body?.text) {
      this.messageParsed = null
      return
    }

    const room = await this._roomRepository.findFirst({ _id: body.roomId }, ['contact'])
    if (!room || room.closed) {
      this.messageParsed = null
      return
    }

    this.messageParsed = {
      contact: room.contact,
      room,
      action: this.action(),
      messages: [{ kind: 'text', text: { body: body.text }, senderName: body.agentName ?? null }],
    }
  }

  async closeChat(messageId: any) {
    const message = await this.messageRepository.findFirst({ _id: messageId }, ['contact', 'room'])
    if (!message?.room) return []

    const room = await this._roomRepository.findFirst({ _id: message.room._id })
    room.status = 'closed'
    await this._roomRepository.save(room)

    return []
  }
}

export { LocalChat }
