const Message = require('@models/Message')
const Contact = require('@models/Contact')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const request = require('../../services/request')

const readChat = async (chatId, url, token) => {
  const readChatUrl = `${url}readChat?token=${token}`

  const body = {
    chatId: chatId,
  }

  const response = await request.post(readChatUrl, { body })

  if (!response.data.read === true) {
    console.error(`Não foi possível ler as mensagens na Chatapi ${JSON.stringify(response.data)}`)
  }

  return response.data.read === true
}

const sendText = async (message, chatId, url, token) => {
  const sendMessageUrl = `${url}sendMessage?token=${token}`

  const body = {
    chatId: chatId,
    body: message.text,
  }

  return await request.post(sendMessageUrl, { body })
}

const sendFile = async (message, chatId, url, token) => {
  const sendFileUrl = `${url}sendFile?token=${token}`

  const body = {
    chatId: chatId,
    body: message.url,
    filename: message.fileName,
    caption: message.text,
  }

  return await request.post(sendFileUrl, { body })
}

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
          licensee: this.licensee._id,
        })

        if (!contact) {
          contact = new Contact({
            name: message.chatName,
            number: normalizePhone.number,
            type: normalizePhone.type,
            talkingWithChatBot: this.licensee.useChatbot,
            licensee: this.licensee._id,
          })

          await contact.save()
        } else {
          if (contact.name !== message.chatName) {
            contact.name = message.chatName
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

        if (normalizePhone.type === '@g.us') messageToSend.senderName = message.senderName

        if (kind === 'text' || kind === 'location') {
          messageToSend.text = message.body
        }

        if (kind === 'file') {
          if (normalizePhone.type === '@g.us') {
            if (message.caption) {
              const textMessageToSend = new Message({
                number: uuidv4(),
                kind: 'text',
                licensee: this.licensee._id,
                contact: contact._id,
                destination: messageToSend.destination,
                text: message.caption,
                senderName: messageToSend.senderName,
              })

              processedMessages.push(await textMessageToSend.save())
            }

            const senderTextMessageToSend = new Message({
              number: uuidv4(),
              kind: 'text',
              licensee: this.licensee._id,
              contact: contact._id,
              destination: messageToSend.destination,
              senderName: messageToSend.senderName,
              text: 'enviou um anexo',
            })

            processedMessages.push(await senderTextMessageToSend.save())
          } else {
            messageToSend.text = message.caption
          }

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

  action(messageDestination) {
    if (messageDestination === 'to-chat') {
      return 'send-message-to-chat'
    } else {
      return 'send-message-to-chatbot'
    }
  }

  async sendMessage(messageId, url, token) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    const chatId = messageToSend.contact.number + messageToSend.contact.type

    if (await readChat(chatId, url, token)) {
      let response
      if (messageToSend.kind === 'text') {
        response = await sendText(messageToSend, chatId, url, token)
      } else {
        response = await sendFile(messageToSend, chatId, url, token)
      }

      if (response.data.sent === true) {
        messageToSend.sended = true
        await messageToSend.save()
        console.info(`Mensagem ${messageToSend._id} enviada para Chatapi com sucesso! ${response.data.message}`)
      } else {
        messageToSend.error = JSON.stringify(response.data)
        await messageToSend.save()
        console.error(`Mensagem ${messageToSend._id} não enviada para Chatapi. ${JSON.stringify(response.data)}`)
      }

      return response.data.sent === true
    }
  }
}

module.exports = Chatapi
