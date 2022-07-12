const files = require('../../helpers/Files')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const request = require('../../services/request')
const mime = require('mime-types')
const ChatsBase = require('./Base')
const { createRoom, getRoomBy } = require('@repositories/room')

const createSession = async (url, headers, contact, segments) => {
  const response = await request.post(`https://api.crisp.chat/v1/website/${url}/conversation`, { headers })

  if (response.status !== 201) {
    console.error(`Não foi possível criar a sessão na Crisp ${JSON.stringify(response.data)}`)
    return
  } else {
    const room = await createRoom({
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

  if (response.data.error === false) {
    message.sended = true
    await message.save()

    console.info(`Mensagem ${message._id} enviada para Crisp com sucesso!`)
  } else {
    message.error = `mensagem: ${JSON.stringify(response.data)}`
    await message.save()
    console.error(
      `Mensagem ${message._id} não enviada para Crisp.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`
    )
  }

  return response.data.success === true
}

const formatMessage = (message, contact) => {
  const text = message.text

  return contact.type === '@c.us' ? text : `*${message.senderName}:*\n${text}`
}

class Crisp extends ChatsBase {
  constructor(licensee) {
    super(licensee)
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

    const room = await getRoomBy({ roomId: responseBody.data.session_id })
    if (!room) {
      // room = await createRoom({ roomId: responseBody.data.session_id, contact })
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
    const messageToSend = await Message.findById(messageId).populate('contact')
    const contact = await Contact.findById(messageToSend.contact._id)

    contact.talkingWithChatBot = false
    await contact.save()

    await this.sendMessage(messageId, url)
  }

  async sendMessage(messageId, url) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    const basicToken = Buffer.from(`${this.licensee.chatIdentifier}:${this.licensee.chatKey}`).toString('base64')
    const headers = { Authorization: `Basic ${basicToken}`, 'X-Crisp-Tier': 'plugin' }
    const openRoom = await getRoomBy({ contact: messageToSend.contact, closed: false })
    let room = openRoom

    if (!room) {
      room = await createSession(url, headers, messageToSend.contact, messageToSend.departament)
      if (!room) {
        return
      }
    } else {
      if (messageToSend.departament) {
        await updateSegments(url, headers, messageToSend.departament, room)
      }
    }

    await postMessage(url, headers, messageToSend.contact, messageToSend, room)
  }

  static messageType(fileUrl) {
    let type = 'file'
    if (files.isMidia(fileUrl)) {
      type = 'audio'
    }

    return type
  }

  async closeChat(messageId) {
    const message = await Message.findById(messageId).populate('contact').populate('licensee').populate('room')
    const licensee = message.licensee
    const contact = await Contact.findById(message.contact._id)

    if (licensee.useChatbot) {
      contact.talkingWithChatBot = true
      await contact.save()
    }
  }
}

module.exports = Crisp
