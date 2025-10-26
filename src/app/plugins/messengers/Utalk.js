import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import request from '../../services/request.js'
import { MessengersBase } from './Base.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'

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

  parseContactData(responseBody) {
    if (!responseBody.event || !['chat', 'file'].includes(responseBody.event)) {
      this.contactData = null
      return
    }

    if (responseBody.event === 'chat') {
      if (responseBody['chat[dir]'] === 'o' || !responseBody['contact[server]']) {
        this.contactData = null
        return
      }

      const chatNumber =
        responseBody['contact[server]'] === 'g.us'
          ? responseBody['contact[groupNumber]']
          : responseBody['contact[number]']
      const chatName =
        responseBody['contact[server]'] === 'g.us' ? responseBody['contact[groupName]'] : responseBody['contact[name]']

      const chatId = chatNumber + '@' + responseBody['contact[server]']
      const normalizePhone = new NormalizePhone(chatId)
      this.contactData = {
        name: chatName,
        server: responseBody['contact[server]'],
        number: normalizePhone.number,
        type: normalizePhone.type,
        waId: null,
      }
    }

    if (responseBody.event === 'file') {
      if (responseBody['dir'] === 'o' || !responseBody['number']) {
        this.contactData = null
        return
      }

      const normalizePhone = new NormalizePhone(responseBody['number'])
      this.contactData = {
        name: normalizePhone.number,
        server: '',
        number: normalizePhone.number,
        type: normalizePhone.type,
        waId: null,
      }
    }
  }

  contactWithDifferentData(contact) {
    return (
      this.contactData &&
      this.contactData.name &&
      contact.name !== this.contactData.name &&
      this.messageData &&
      this.messageData.kind !== 'file'
    )
  }

  shouldUpdateWaStartChat(_) {
    return false
  }

  async sendMessage(messageId, url, token) {
    const messageRepository = new MessageRepositoryDatabase()
    const messageToSend = await messageRepository.findFirst({ _id: messageId }, ['contact'])

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

export { Utalk }
