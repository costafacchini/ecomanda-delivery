const emoji = require('../../helpers/Emoji')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Room = require('@models/Room')
const request = require('../../services/request')
const ChatsBase = require('./Base')

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

const createRoom = async (contact, token, url) => {
  const response = await request.get(`${url}/api/v1/livechat/room?token=${token}`)

  if (response.data.success !== true) {
    console.error(`Não foi possível criar a sala na Rocketchat ${JSON.stringify(response.data)}`)
    return
  }

  const room = await Room.create({
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
  constructor(licensee) {
    super(licensee)
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

    const room = await Room.findOne({ roomId: responseBody._id }).populate('contact')
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
          text: emoji.replace(message.attachments[0].description),
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
    const messageToSend = await Message.findById(messageId).populate('contact')
    const contact = await Contact.findById(messageToSend.contact._id)

    contact.talkingWithChatBot = false
    await contact.save()

    await this.sendMessage(messageId, url)
  }

  async sendMessage(messageId, url) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    const openRoom = await Room.findOne({ contact: messageToSend.contact, closed: false })
    let room = openRoom

    if (!room) {
      const token = messageToSend.contact._id.toString()
      if ((await createVisitor(messageToSend.contact, token, url)) === true) {
        room = await createRoom(messageToSend.contact, token, url)
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
      await messageToSend.save()

      console.info(`Mensagem ${messageToSend._id} enviada para Rocketchat com sucesso!`)
    } else {
      messageToSend.error = messageToSend.error
        ? `${messageToSend.error} | ${JSON.stringify(response.data)}`
        : JSON.stringify(response.data)
      if (messageToSend.error.includes('room-closed')) {
        room.closed = true
        await room.save()
        messageToSend.room = null
      }
      await messageToSend.save()

      if (messageToSend.error.includes('room-closed')) {
        await this.sendMessage(messageToSend._id, url)
      } else {
        console.error(`Mensagem ${messageToSend._id} não enviada para a Rocketchat ${JSON.stringify(response.data)}`)
      }
    }

    return response.data.success === true
  }

  async closeChat(messageId) {
    const message = await Message.findById(messageId).populate('contact').populate('licensee').populate('room')
    const licensee = message.licensee
    const contact = await Contact.findById(message.contact._id)
    const room = await Room.findById(message.room._id)

    room.closed = true
    await room.save()

    if (licensee.useChatbot) {
      contact.talkingWithChatBot = true
      await contact.save()
    }
  }
}

module.exports = Rocketchat
