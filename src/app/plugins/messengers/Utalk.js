const Message = require('@models/Message')
const NormalizePhone = require('../../helpers/NormalizePhone')
const request = require('../../services/request')
const MessengersBase = require('./Base')

class Utalk extends MessengersBase {
  constructor(licensee) {
    super(licensee)
  }

  action(messageDestination) {
    if (messageDestination === 'to-chat') {
      return 'send-message-to-chat'
    } else {
      return 'send-message-to-chatbot'
    }
  }

  parseMessageStatus() {
    this.messageStatus = null
  }

  parseMessage(responseBody) {
    if (!responseBody.event) {
      this.messageData = null
      return
    }

    if (responseBody.event === 'ack' || responseBody.event === 'login') {
      this.messageData = null
      return
    }

    if (responseBody.event === 'chat' && responseBody['chat[type]'] !== 'chat' && !responseBody['caption']) {
      this.messageData = null
      return
    }

    if (responseBody.event === 'chat') {
      if (responseBody['chat[dir]'] === 'o') {
        this.messageData = null
        return
      }

      const chatNumber =
        responseBody['contact[server]'] === 'g.us'
          ? responseBody['contact[groupNumber]']
          : responseBody['contact[number]']
      const chatName =
        responseBody['contact[server]'] === 'g.us' ? responseBody['contact[groupName]'] : responseBody['contact[name]']

      this.messageData = {
        waId: null,
        sender: responseBody['contact[server]'] === 'g.us' ? responseBody['contact[name]'] : '',
        contact: {
          name: chatName,
          server: responseBody['contact[server]'],
          number: chatNumber,
          chatId: chatNumber + '@' + responseBody['contact[server]'],
        },
        kind: 'text',
        text: { body: responseBody['chat[type]'] === 'chat' ? responseBody['chat[body]'] : responseBody['caption'] },
      }
    }

    if (responseBody.event === 'file') {
      if (responseBody['dir'] === 'o') {
        this.messageData = null
        return
      }

      this.messageData = {
        waId: null,
        sender: responseBody['contact[server]'] === 'g.us' ? responseBody['contact[name]'] : '',
        contact: {
          name: responseBody['number'],
          server: '',
          number: responseBody['number'],
          chatId: responseBody['number'],
        },
        kind: 'file',
        file: {
          id: null,
          fileName: responseBody['fn'],
          fileBase64: responseBody['blob'],
        },
      }
    }
  }

  parseContactData() {
    const chatId = this.messageData.contact.chatId
    const normalizePhone = new NormalizePhone(chatId)
    this.contactData = {
      number: normalizePhone.number,
      type: normalizePhone.type,
      name: this.messageData.contact.name,
      waId: null,
    }
  }

  contactWithDifferentData(contact) {
    return contact.name !== this.contactData.name && this.messageData.kind !== 'file' && this.contactData.name
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
