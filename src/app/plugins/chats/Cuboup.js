const emoji = require('../../helpers/Emoji')
const files = require('../../helpers/Files')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const request = require('../../services/request')
const ChatsBase = require('./Base')
const logger = require('@config/logger')

class Cuboup extends ChatsBase {
  constructor(licensee) {
    super(licensee)
  }

  action(responseBody) {
    const { message } = responseBody

    if (message.text === 'Chat encerrado pelo agente' || message.text === 'Chat closed by agent') {
      return 'close-chat'
    } else {
      return 'send-message-to-messenger'
    }
  }

  async parseMessage(responseBody) {
    const { recipient, message } = responseBody

    if (!message || !recipient) {
      this.messageParsed = null
      return []
    }

    if (message.type === 'typein' || message.type === 'typeout' || message.type === 'stop') {
      this.messageParsed = null
      return []
    }

    this.messageParsed = { room: null }

    const normalizePhone = new NormalizePhone(recipient.id)
    this.messageParsed.contact = await this.findContact({
      number: normalizePhone.number,
      type: normalizePhone.type,
      licensee: this.licensee._id,
    })

    const messageToSend = {}
    messageToSend.kind = Cuboup.kindToMessageKind(message.type)

    if (!messageToSend.kind) {
      logger.info(`Tipo de mensagem retornado pela CuboUp não reconhecido: ${message.type}`)
      this.messageParsed = null
      return []
    }

    if (messageToSend.kind === 'text') {
      messageToSend.text = { body: emoji.replace(message.text) }
    } else if (messageToSend.kind === 'location') {
      messageToSend.location = { latitude: message.latitude, longitude: message.longitude }
    } else {
      messageToSend.kind = 'file'
      messageToSend.file = {
        fileName: message.file_name,
        url: message.file,
      }
    }

    this.messageParsed.messages = [messageToSend]
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
        body.message.text = `${messageToSend.senderName}:\n${messageToSend.text}\n.`
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
      body.message.type = Cuboup.messageType(messageToSend.url)
      body.message.file = messageToSend.url
      body.message.file_name = messageToSend.fileName
    }

    const response = await request.post(`${url}`, { body })

    if (response.status === 200) {
      messageToSend.sended = true
      await messageToSend.save()
      logger.info(`Mensagem ${messageToSend._id} enviada para CuboUp com sucesso!`)
    } else {
      messageToSend.error = `mensagem: ${JSON.stringify(response.data)}`
      await messageToSend.save()
      logger.error(
        `Mensagem ${messageToSend._id} não enviada para CuboUp.
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

    if (licensee.useChatbot) {
      contact.talkingWithChatBot = true
      await contact.save()
    }
  }
}

module.exports = Cuboup
