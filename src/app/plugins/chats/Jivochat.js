const emoji = require('../../helpers/Emoji')
const files = require('../../helpers/Files')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const request = require('../../services/request')

class Jivochat {
  constructor(licensee) {
    this.licensee = licensee
  }

  action(responseBody) {
    const { message } = responseBody

    if (message.text === 'Chat encerrado pelo agente' || message.text === 'Chat closed by agent') {
      return 'close-chat'
    } else {
      return 'send-message-to-messenger'
    }
  }

  async responseToMessages(responseBody) {
    const { recipient, message } = responseBody

    if (!message || !recipient) return []
    if (message.type === 'typein' || message.type === 'typeout' || message.type === 'stop') return []

    const normalizePhone = new NormalizePhone(recipient.id)

    const contact = await Contact.findOne({
      number: normalizePhone.number,
      type: normalizePhone.type,
      licensee: this.licensee._id,
    })

    const kind = Jivochat.kindToMessageKind(message.type)

    if (!kind) {
      console.info(`Tipo de mensagem retornado pela Jivochat não reconhecido: ${message.type}`)
      return []
    }

    const text = message.type === 'text' ? emoji.replace(message.text) : ''

    const messageToSend = new Message({
      number: uuidv4(),
      text,
      kind,
      licensee: this.licensee._id,
      contact: contact._id,
      destination: 'to-messenger',
    })

    if (kind === 'file') {
      messageToSend.url = message.file
      messageToSend.fileName = message.file_name
    }

    if (kind === 'location') {
      messageToSend.latitude = message.latitude
      messageToSend.longitude = message.longitude
    }

    await messageToSend.save()

    return [messageToSend]
  }

  static kindToMessageKind(kind) {
    switch (kind) {
      case 'text':
        return 'text'
      case 'video':
        return 'file'
      case 'audio':
        return 'file'
      case 'voice':
        return 'file'
      case 'photo':
        return 'file'
      case 'document':
        return 'file'
      case 'sticker':
        return 'file'
      case 'location':
        return 'location'
      default:
        return undefined
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

    const sender = {
      id: messageToSend.contact.number + messageToSend.contact.type,
      name: messageToSend.contact.name,
      email: messageToSend.contact.email,
    }

    if (messageToSend.contact.type === '@c.us') sender.phone = messageToSend.contact.number

    const body = {
      sender,
      message: {
        id: uuidv4(),
      },
    }

    if (messageToSend.kind === 'text') {
      body.message.type = 'text'
      if (messageToSend.contact.type === '@g.us') {
        body.message.text = `${messageToSend.senderName}:\\n${messageToSend.text}\\n`
      } else {
        body.message.text = messageToSend.text
      }
    }

    if (messageToSend.kind === 'location') {
      body.message.type = 'location'
      body.message.latitude = messageToSend.latitude
      body.message.longitude = messageToSend.longitude
    }

    if (messageToSend.kind === 'file') {
      body.message.type = Jivochat.messageType(messageToSend.url)
      body.message.file = messageToSend.url
      body.message.file_name = messageToSend.fileName
    }

    const response = await request.post(`${url}`, { body })

    if (response.status === 200) {
      messageToSend.sended = true
      await messageToSend.save()
      console.info(`Mensagem ${messageToSend._id} enviada para Jivochat com sucesso!`)
    } else {
      messageToSend.error = `mensagem: ${JSON.stringify(response.data)}`
      await messageToSend.save()
      console.error(
        `Mensagem ${messageToSend._id} não enviada para Jivochat.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`
      )
    }
  }

  static messageType(fileUrl) {
    let type
    if (files.isPhoto(fileUrl)) {
      type = 'photo'
    }
    if (files.isVideo(fileUrl)) {
      type = 'video'
    }
    if (files.isMidia(fileUrl)) {
      type = 'audio'
    }
    if (files.isVoice(fileUrl)) {
      type = 'voice'
    }
    if (!type) {
      type = 'document'
    }

    return type
  }

  async closeChat(messageId) {
    const message = await Message.findById(messageId).populate('contact').populate('licensee')
    const licensee = message.licensee
    const contact = await Contact.findById(message.contact._id)

    contact.roomId = ''
    if (licensee.useChatbot) {
      contact.talkingWithChatBot = true
    }
    await contact.save()
  }
}

module.exports = Jivochat
