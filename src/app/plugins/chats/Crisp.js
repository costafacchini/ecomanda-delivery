const emoji = require('../../helpers/Emoji')
const files = require('../../helpers/Files')
const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Room = require('@models/Room')
const Trigger = require('@models/Trigger')
const request = require('../../services/request')
const mime = require('mime-types')

const createSession = async (url, headers, contact, segments) => {
  const response = await request.post(`https://api.crisp.chat/v1/website/${url}/conversation`, { headers })

  if (response.status !== 201) {
    console.error(`Não foi possível criar a sessão na Crisp ${JSON.stringify(response.data)}`)
    return
  } else {
    const room = await Room.create({
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

class Crisp {
  constructor(licensee) {
    this.licensee = licensee
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

  async responseToMessages(responseBody) {
    if (responseBody.event !== 'session:removed' && responseBody.event !== 'message:received') return []

    const room = await Room.findOne({ roomId: responseBody.data.session_id }).populate('contact')
    if (!room) return []

    const contact = await Contact.findOne({ _id: room.contact._id })

    const processedMessages = []

    if (this.action(responseBody) === 'close-chat') {
      const messageToSend = new Message({
        number: uuidv4(),
        text: 'Chat encerrado pelo agente',
        kind: 'text',
        licensee: this.licensee._id,
        contact: contact._id,
        room: room._id,
        destination: 'to-messenger',
      })

      processedMessages.push(await messageToSend.save())
    } else {
      if (
        responseBody.data.type === 'text' ||
        responseBody.data.type === 'file' ||
        responseBody.data.type === 'audio'
      ) {
        const messageToSend = new Message({
          number: uuidv4(),
          kind: 'text',
          licensee: this.licensee._id,
          contact: contact._id,
          room: room._id,
          destination: 'to-messenger',
        })

        if (responseBody.data.type === 'text') {
          const text = responseBody.data.content
          messageToSend.text = text ? emoji.replace(text) : ''

          const trigger = await Trigger.findOne({ expression: text, licensee: this.licensee._id })
          if (trigger) {
            messageToSend.kind = 'interactive'
            messageToSend.trigger = trigger._id
          }
        }

        if (responseBody.data.type === 'file' || responseBody.data.type === 'audio') {
          messageToSend.kind = 'file'
          messageToSend.fileName = responseBody.data.content.name
          messageToSend.url = responseBody.data.content.url
        }

        processedMessages.push(await messageToSend.save())
      } else {
        return []
      }
    }

    return processedMessages
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
    const openRoom = await Room.findOne({ contact: messageToSend.contact, closed: false })
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
