import { isMidia } from '../../helpers/Files.js'
import request from '../../services/request.js'
import mime from 'mime-types'
import { ChatsBase } from './Base.js'
import { RoomRepositoryDatabase } from '../../repositories/room.js'

const createSession = async (url, headers, contact, segments, roomRepository) => {
  const response = await request.post(`https://api.crisp.chat/v1/website/${url}/conversation`, { headers })

  if (response.status !== 201) {
    console.error(`Não foi possível criar a sessão na Crisp ${JSON.stringify(response.data)}`)
    return
  } else {
    const room = await roomRepository.create({
      roomId: response.data.data.session_id,
      contact: contact._id,
    })

    await updateContact(url, headers, contact, response.data.data.session_id, segments)

    return room
  }
}

const updateContact = async (url, headers, contact, room, segments) => {
  const body = {
    nickname: `${contact.name} - ${contact.number} - WhatsApp`,
    email: contact.email ? `${contact.email}` : `${contact.number}${contact.type}`,
    phone: contact.number,
  }

  if (segments) {
    body.segments = segments.split(',')
  }

  await request.patch(`https://api.crisp.chat/v1/website/${url}/conversation/${room}/meta`, {
    headers,
    body,
  })
}

const updateSegments = async (url, headers, segments, room) => {
  const body = {
    segments: segments.split(','),
  }

  await request.patch(`https://api.crisp.chat/v1/website/${url}/conversation/${room.roomId}/meta`, {
    headers,
    body,
  })
}

const postMessage = async (url, headers, contact, message, room) => {
  const body = {
    from: 'user',
    origin: 'chat',
  }

  if (message.kind === 'text') {
    body.type = 'text'
    body.content = formatMessage(message, contact)
  }

  if (message.kind === 'file') {
    body.type = Crisp.messageType(message.url)

    const content = {
      name: message.fileName,
      url: message.url,
      type: mime.lookup(message.url),
    }

    if (body.type === 'audio') {
      content.duration = 60
    }

    body.content = content
  }

  const response = await request.post(`https://api.crisp.chat/v1/website/${url}/conversation/${room.roomId}/message`, {
    headers,
    body,
  })

  return response
}

const persistPostedMessage = async (messageRepository, message, response) => {
  if (response.data.error === false) {
    message.sended = true
    await messageRepository.save(message)

    console.info(`Mensagem ${message._id} enviada para Crisp com sucesso!`)
  } else {
    message.error = `mensagem: ${JSON.stringify(response.data)}`
    await messageRepository.save(message)
    console.error(
      `Mensagem ${message._id} não enviada para Crisp.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`,
    )
  }

  return response.data.success === true
}

const formatMessage = (message, contact) => {
  const text = message.text

  return contact.type === '@c.us' ? text : `*${message.senderName}:*\n${text}`
}

class Crisp extends ChatsBase {
  constructor(licensee, { roomRepository, contactRepository, messageRepository, ...dependencies } = {}) {
    super(licensee, { contactRepository, messageRepository, ...dependencies })
    this._roomRepository = roomRepository
  }

  get roomRepository() {
    this._roomRepository ??= new RoomRepositoryDatabase()
    return this._roomRepository
  }

  action(responseBody) {
    if (
      responseBody.event === 'session:removed' ||
      (responseBody.event === 'message:received' && responseBody.data.content.namespace === 'state:resolved')
    ) {
      return 'close-chat'
    } else {
      return 'send-message-to-messenger'
    }
  }

  async parseMessage(responseBody) {
    if (responseBody.event !== 'session:removed' && responseBody.event !== 'message:received') {
      this.messageParsed = null
      return
    }

    const room = await this.roomRepository.findFirst({ roomId: responseBody.data.session_id })
    if (!room) {
      // room = await this.roomRepository.create({ roomId: responseBody.data.session_id, contact })
      this.messageParsed = null
      return
    }

    this.messageParsed = { room }
    this.messageParsed.contact = await this.findContact({ _id: room.contact._id })
    this.messageParsed.action = this.action(responseBody)

    const messageToSend = {}
    messageToSend.kind = responseBody.data.type
    if (responseBody.data.type === 'text') {
      messageToSend.text = { body: responseBody.data.content }
    } else if (responseBody.data.type === 'file') {
      messageToSend.kind = 'file'
      messageToSend.file = {
        fileName: responseBody.data.content.name,
        url: responseBody.data.content.url,
      }
    } else if (responseBody.data.type === 'audio') {
      messageToSend.kind = 'file'
      messageToSend.file = {
        fileName: responseBody.data.content.name || responseBody.data.content.url,
        url: responseBody.data.content.url,
      }
    }

    this.messageParsed.messages = [messageToSend]
  }

  async transfer(messageId, url) {
    const messageToSend = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])
    const contact = await this.contactRepository.findFirst({ _id: messageToSend.contact._id })

    contact.talkingWithChatBot = false
    await this.contactRepository.save(contact)

    await this.sendMessage(messageId, url)
  }

  async sendMessage(messageId, url) {
    const messageToSend = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])
    const basicToken = Buffer.from(`${this.licensee.chatIdentifier}:${this.licensee.chatKey}`).toString('base64')
    const headers = { Authorization: `Basic ${basicToken}`, 'X-Crisp-Tier': 'plugin' }
    const openRoom = await this.roomRepository.findFirst({ contact: messageToSend.contact, closed: false })
    let room = openRoom

    if (!room) {
      room = await createSession(url, headers, messageToSend.contact, messageToSend.departament, this.roomRepository)
      if (!room) {
        return
      }
    } else {
      if (messageToSend.departament) {
        await updateSegments(url, headers, messageToSend.departament, room)
      }
    }

    const response = await postMessage(url, headers, messageToSend.contact, messageToSend, room)
    await persistPostedMessage(this.messageRepository, messageToSend, response)
  }

  static messageType(fileUrl) {
    let type = 'file'
    if (isMidia(fileUrl)) {
      type = 'audio'
    }

    return type
  }

  async closeChat(messageId) {
    const message = await this.messageRepository.findFirst({ _id: messageId }, ['contact', 'licensee', 'room'])
    const licensee = message.licensee

    const contact = await this.contactRepository.findFirst({ _id: message.contact._id })
    const messages = []

    if (licensee.messageOnCloseChat) {
      const messagesCloseChat = await this.messageRepository.createInteractiveMessages({
        kind: 'text',
        text: licensee.messageOnCloseChat,
        licensee,
        contact,
        destination: 'to-messenger',
      })

      messages.push(...messagesCloseChat)
    }

    if (licensee.useChatbot) {
      contact.talkingWithChatBot = true
      await this.contactRepository.save(contact)
    }

    return messages
  }
}

export { Crisp }
