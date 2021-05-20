const Message = require('@models/Message')
const Contact = require('@models/Contact')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const request = require('../../services/request')

class Chatapi {
  constructor(licensee) {
    this.licensee = licensee
  }

  async responseToMessages(responseBody) {
    const { messages } = responseBody

    if (!messages) return []

    const processedMessages = []
    if (messages) {
      for (const message of messages) {
        if (message.fromMe === true) {
          continue
        }

        const normalizePhone = new NormalizePhone(message.chatId)

        let contact = await Contact.findOne({
          number: normalizePhone.number,
          type: normalizePhone.type,
          licensee: this.licensee,
        })

        if (!contact) {
          contact = new Contact({
            name: message.senderName,
            number: normalizePhone.number,
            type: normalizePhone.type,
            talkingWithChatBot: this.licensee.useChatbot,
            licensee: this.licensee._id
          })

          await contact.save()
        } else {
          if (contact.name !== message.senderName) {
            contact.name = message.senderName
            await contact.save()
          }
        }

        const kind = Chatapi.kindToMessageKind(message.type)

        const messageToSend = new Message({
          number: uuidv4(),
          kind,
          licensee: this.licensee._id,
          contact: contact._id,
          destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
        })

        if (kind === 'text' || kind === 'location') {
          messageToSend.text = message.body
        }

        if (kind === 'file') {
          messageToSend.text = message.caption
          messageToSend.url = message.body
          messageToSend.fileName = message.body.match(/[^\\/]+$/)[0]
        }

        processedMessages.push(await messageToSend.save())
      }
    }

    return processedMessages
  }

  static kindToMessageKind(kind) {
    switch (kind) {
      case 'chat':
        return 'text'
      case 'image':
        return 'file'
      case 'video':
        return 'file'
      case 'ppt':
        return 'file'
      case 'audio':
        return 'file'
      case 'document':
        return 'file'
      case 'location':
        return 'location'
      default:
        return undefined
    }
  }

  static action(messageDestination) {
    if (messageDestination === 'to_chat') {
      return 'send-message-to-chat'
    } else {
      return  'send-message-to-chatbot'
    }
  }

  async sendMessage(messageId, url, token) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    const chatId = messageToSend.contact.number + messageToSend.contact.type

    if (await this.#readChat(chatId, url, token)) {
      if (messageToSend.kind === 'text') {
        if (!await this.#sendText(messageToSend._id, messageToSend.text, chatId, url, token)) {
          return
        }
      } else {
        if (!await this.#sendFile(messageToSend._id, messageToSend.text, messageToSend.url, messageToSend.fileName, chatId, url, token)) {
          return
        }
      }
      messageToSend.sended = true
      await messageToSend.save()
    }
  }

  async #readChat(chatId, url, token) {
    const readChatUrl = `${url}readChat?token=${token}`

    const body = {
      chatId: chatId
    }

    const response = await request.post(readChatUrl, { body })

    if (!response.data.read === true) {
      console.error(`Não foi possível ler as mensagens na Chatapi ${JSON.stringify(response.data)}`)
    }

    return response.data.read === true
  }

  async #sendText(messageId, message, chatId, url, token) {
    const sendMessageUrl = `${url}sendMessage?token=${token}`

    const body = {
      chatId: chatId,
      body: message
    }

    const response = await request.post(sendMessageUrl, { body })

    if (response.data.sent === true) {
      console.info(`Mensagem ${messageId} enviada para Chatapi com sucesso! ${response.data.message}`)
    } else {
      console.error(`Mensagem ${messageId} não enviada para Chatapi. ${JSON.stringify(response.data)}`)
    }

    return response.data.sent === true
  }

  async #sendFile(messageId, text, fileUrl, fileName, chatId, url, token) {
    const sendFileUrl = `${url}sendFile?token=${token}`

    const body = {
      chatId: chatId,
      body: fileUrl,
      filename: fileName,
      caption: text,
    }

    const response = await request.post(sendFileUrl, { body })

    if (response.data.sent === true) {
      console.info(`Mensagem ${messageId} enviada para Chatapi com sucesso! ${response.data.message}`)
    } else {
      console.error(`Mensagem ${messageId} não enviada para Chatapi. ${JSON.stringify(response.data)}`)
    }

    return response.data.sent === true
  }
}

module.exports = Chatapi
