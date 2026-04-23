import { replace } from '../../helpers/Emoji.js'
import { isPhoto, isVideo, isMidia, isVoice } from '../../helpers/Files.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import { v4 as uuidv4 } from 'uuid'
import request from '../../services/request.js'
import { ChatsBase } from './Base.js'

class Cuboup extends ChatsBase {
  constructor(licensee, { contactRepository, messageRepository, ...dependencies } = {}) {
    super(licensee, { contactRepository, messageRepository, ...dependencies })
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
      console.info(`Tipo de mensagem retornado pela CuboUp não reconhecido: ${message.type}`)
      this.messageParsed = null
      return []
    }

    if (messageToSend.kind === 'text') {
      messageToSend.text = { body: replace(message.text) }
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
    const messageToSend = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])
    const contact = await this.contactRepository.findFirst({ _id: messageToSend.contact._id })

    contact.talkingWithChatBot = false
    await this.contactRepository.save(contact)

    await this.sendMessage(messageId, url)
  }

  async sendMessage(messageId, url) {
    const messageToSend = await this.messageRepository.findFirst({ _id: messageId }, ['contact', 'licensee'])

    const sender = {
      id: messageToSend.contact.number + messageToSend.contact.type,
      name: messageToSend.contact.name,
      email: messageToSend.contact.email,
    }

    const licenseePhone = new NormalizePhone(messageToSend.licensee.phone)
    const recipient = {
      id: licenseePhone.number,
    }

    if (messageToSend.contact.type === '@c.us') sender.phone = messageToSend.contact.number

    const body = {
      recipient,
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
      await this.messageRepository.save(messageToSend)
      console.info(`Mensagem ${messageToSend._id} enviada para CuboUp com sucesso!`)
    } else {
      messageToSend.error = `mensagem: ${JSON.stringify(response.data)}`
      await this.messageRepository.save(messageToSend)
      console.error(
        `Mensagem ${messageToSend._id} não enviada para CuboUp.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`,
      )
    }
  }

  static messageType(fileUrl) {
    let type
    if (isPhoto(fileUrl)) {
      type = 'photo'
    }
    if (isVideo(fileUrl)) {
      type = 'video'
    }
    if (isMidia(fileUrl)) {
      type = 'audio'
    }
    if (isVoice(fileUrl)) {
      type = 'voice'
    }
    if (!type) {
      type = 'document'
    }

    return type
  }

  async closeChat(messageId) {
    const message = await this.messageRepository.findFirst({ _id: messageId }, ['contact', 'licensee'])
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

export { Cuboup }
