const Message = require('@models/Message')
const Contact = require('@models/Contact')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const S3 = require('../storage/S3')
const request = require('../../services/request')

const parseBody = (responseBody) => {
  if (responseBody.event === 'chat' && responseBody['chat[type]'] !== 'chat' && !responseBody['caption']) {
    return {
      dir: 'o',
    }
  }

  if (responseBody.event === 'chat') {
    const chatNumber =
      responseBody['contact[server]'] === 'g.us'
        ? responseBody['contact[groupNumber]']
        : responseBody['contact[number]']
    const chatName =
      responseBody['contact[server]'] === 'g.us' ? responseBody['contact[groupName]'] : responseBody['contact[name]']

    return {
      name: chatName,
      type: 'text',
      server: responseBody['contact[server]'],
      number: chatNumber,
      dir: responseBody['chat[dir]'],
      text: responseBody['chat[type]'] === 'chat' ? responseBody['chat[body]'] : responseBody['caption'],
      sender: responseBody['contact[server]'] === 'g.us' ? responseBody['contact[name]'] : '',
    }
  }

  if (responseBody.event === 'file') {
    return {
      name: responseBody['number'],
      type: 'file',
      server: '',
      number: responseBody['number'],
      dir: responseBody['dir'],
      fileName: responseBody['fn'],
      blob: responseBody['blob'],
      sender: responseBody['contact[server]'] === 'g.us' ? responseBody['contact[name]'] : '',
    }
  }

  if (responseBody.event === 'ack') {
    return {
      dir: 'o',
    }
  }
}

const uploadFile = (licensee, contact, fileName, fileBase64) => {
  const s3 = new S3(licensee, contact, fileName, fileBase64)
  s3.uploadFile()

  return s3.presignedUrl()
}

class Utalk {
  constructor(licensee) {
    this.licensee = licensee
  }

  action(messageDestination) {
    if (messageDestination === 'to-chat') {
      return 'send-message-to-chat'
    } else {
      return 'send-message-to-chatbot'
    }
  }

  async responseToMessages(responseBody) {
    if (!responseBody.event) return []

    const bodyParsed = parseBody(responseBody)

    if (bodyParsed.dir === 'o') {
      return []
    }

    const chatId = bodyParsed.number + '@' + bodyParsed.server
    const normalizePhone = new NormalizePhone(chatId)

    let contact = await Contact.findOne({
      number: normalizePhone.number,
      type: normalizePhone.type,
      licensee: this.licensee._id,
    })

    if (!contact) {
      contact = new Contact({
        name: bodyParsed.name,
        number: normalizePhone.number,
        type: normalizePhone.type,
        talkingWithChatBot: this.licensee.useChatbot,
        licensee: this.licensee._id,
      })

      await contact.save()
    } else {
      if (contact.name !== bodyParsed.name && bodyParsed.type !== 'file') {
        console.log('Vai atualizar', bodyParsed.name)
        console.log('Vai atualizar II', contact.name)
        contact.name = bodyParsed.name
        contact.talkingWithChatBot = this.licensee.useChatbot
        await contact.save()
      }
    }

    const messageToSend = new Message({
      number: uuidv4(),
      kind: bodyParsed.type,
      licensee: this.licensee._id,
      contact: contact._id,
      text: bodyParsed.text,
      destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
    })

    if (bodyParsed.sender) messageToSend.senderName = bodyParsed.sender

    if (messageToSend.kind === 'file') {
      messageToSend.fileName = bodyParsed.fileName
      messageToSend.url = uploadFile(this.licensee, contact, messageToSend.fileName, bodyParsed.blob)
    }

    return [await messageToSend.save()]
  }

  async sendMessage(messageId, url, token) {
    const messageToSend = await Message.findById(messageId).populate('contact')

    let body = {
      cmd: 'chat',
      id: messageId,
      to: messageToSend.contact.number + messageToSend.contact.type,
      msg: messageToSend.text,
    }

    if (messageToSend.kind === 'file') {
      body.cmd = 'media'
      body.link = messageToSend.url
    }

    const response = await request.post(`${url}${token}/`, { body })

    if (!response.data.status) {
      messageToSend.sended = true
      await messageToSend.save()
      console.info(`Mensagem ${messageId} enviada para Utalk com sucesso! ${JSON.stringify(response.data)}`)
    } else {
      messageToSend.error = JSON.stringify(response.data)
      await messageToSend.save()
      console.error(`Mensagem ${messageId} não enviada para Utalk. ${JSON.stringify(response.data)}`)
    }
  }
}

module.exports = Utalk
