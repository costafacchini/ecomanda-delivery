import { replace } from '../../helpers/Emoji.js'
import request from '../../services/request.js'
import { ChatsBase } from './Base.js'
import { RoomRepositoryDatabase } from '../../repositories/room.js'

const createVisitor = async (contact, token, url) => {
  const body = {
    visitor: {
      name: `${contact.name} - ${contact.number} - WhatsApp`,
      email: contact.email ? `${contact.email}` : `${contact.number}${contact.type}`,
      token: `${token}`,
    },
  }

  const response = await request.post(`${url}/api/v1/livechat/visitor`, { body })

  if (response.data.success !== true) {
    console.error(`Não foi possível criar o visitante na Rocketchat ${JSON.stringify(response.data)}`)
  }

  return response.data.success === true
}

const createRoom = async (contact, token, url, roomRepository) => {
  const response = await request.get(`${url}/api/v1/livechat/room?token=${token}`)

  if (response.data.success !== true) {
    console.error(`Não foi possível criar a sala na Rocketchat ${JSON.stringify(response.data)}`)
    return
  }

  const room = await roomRepository.create({
    roomId: response.data.room._id,
    contact: contact._id,
    token: token,
  })

  return room
}

const transferToDepartament = async (department, room, url) => {
  const body = {
    token: `${room.token}`,
    rid: room.roomId,
    department,
  }

  await request.post(`${url}/api/v1/livechat/room.transfer`, { body })
}

const postMessage = async (contact, message, room, url) => {
  const body = {
    token: `${room.token}`,
    rid: room.roomId,
    msg: formatMessage(message, contact),
  }

  return await request.post(`${url}/api/v1/livechat/message`, { body })
}

const formatMessage = (message, contact) => {
  let text = message.text
  if (message.kind === 'file') {
    text = message.url
  }

  return contact.type === '@c.us' ? text : `*${message.senderName}:*\n${text}`
}

class Rocketchat extends ChatsBase {
  constructor(licensee, { roomRepository, contactRepository, messageRepository, ...dependencies } = {}) {
    super(licensee, { contactRepository, messageRepository, ...dependencies })
    this._roomRepository = roomRepository
  }

  get roomRepository() {
    this._roomRepository ??= new RoomRepositoryDatabase()
    return this._roomRepository
  }

  action(responseBody) {
    if (responseBody.type === 'LivechatSession') {
      return 'close-chat'
    } else {
      if (responseBody && responseBody.messages && responseBody.messages.find((message) => message.closingMessage)) {
        return 'close-chat'
      } else {
        return 'send-message-to-messenger'
      }
    }
  }

  async parseMessage(responseBody) {
    if (!responseBody._id) {
      this.messageParsed = null
      return []
    }

    const room = await this.roomRepository.findFirst({ roomId: responseBody._id })
    if (!room) {
      this.messageParsed = null
      return
    }

    this.messageParsed = { room }
    this.messageParsed.contact = await this.findContact({ _id: room.contact._id })
    this.messageParsed.action = this.action(responseBody)
    this.messageParsed.messages = []
    for (const message of responseBody.messages) {
      const messageToSend = {}

      if (message.attachments) {
        messageToSend.kind = 'file'
        messageToSend.file = {
          text: replace(message.attachments[0].description),
          url: message.fileUpload.publicFilePath,
          fileName: message.attachments[0].title,
        }
      } else {
        messageToSend.kind = 'text'
        messageToSend.text = { body: message.msg }
      }

      this.messageParsed.messages.push(messageToSend)
    }
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
    const openRoom = await this.roomRepository.findFirst({ contact: messageToSend.contact, closed: false })
    let room = openRoom

    if (!room) {
      const token = messageToSend.contact._id.toString()
      if ((await createVisitor(messageToSend.contact, token, url)) === true) {
        room = await createRoom(messageToSend.contact, token, url, this.roomRepository)
        if (!room) {
          return
        }
      } else {
        return
      }
    }

    if (messageToSend.departament && messageToSend.departament !== '') {
      await transferToDepartament(messageToSend.departament, room, url)
    }

    const response = await postMessage(messageToSend.contact, messageToSend, room, url)

    if (!messageToSend.room || messageToSend.room._id !== room._id) messageToSend.room = room

    if (response.data.success === true) {
      messageToSend.sended = true
      await this.messageRepository.save(messageToSend)

      console.info(`Mensagem ${messageToSend._id} enviada para Rocketchat com sucesso!`)
    } else {
      messageToSend.error = messageToSend.error
        ? `${messageToSend.error} | ${JSON.stringify(response.data)}`
        : JSON.stringify(response.data)
      if (messageToSend.error.includes('room-closed')) {
        room.closed = true
        await this.roomRepository.save(room)
        messageToSend.room = null
      }
      await this.messageRepository.save(messageToSend)

      if (messageToSend.error.includes('room-closed')) {
        await this.sendMessage(messageToSend._id, url)
      } else {
        console.error(`Mensagem ${messageToSend._id} não enviada para a Rocketchat ${JSON.stringify(response.data)}`)
      }
    }

    return response.data.success === true
  }

  async closeChat(messageId) {
    const message = await this.messageRepository.findFirst({ _id: messageId }, ['contact', 'licensee', 'room'])
    const licensee = message.licensee

    const contact = await this.contactRepository.findFirst({ _id: message.contact._id })

    const room = await this.roomRepository.findFirst({ _id: message.room._id })
    const messages = []

    room.closed = true
    await this.roomRepository.save(room)

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

export { Rocketchat }
