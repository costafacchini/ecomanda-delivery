const emoji = require('../../helpers/Emoji')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const request = require('../../services/request')

class Rocketchat {
  constructor(licensee) {
    this.licensee = licensee
  }

  action(responseBody) {
    if (responseBody.type === 'LivechatSession') {
      return 'close-chat'
    } else {
      return 'send-message-to-messenger'
    }
  }

  async responseToMessages(responseBody) {
    if (!responseBody._id) return []

    const contact = await Contact.findOne({
      roomId: responseBody._id,
      licensee: this.licensee,
    })

    const processedMessages = []

    if (this.action(responseBody) === 'close-chat') {
      const messageToSend = new Message({
        number: uuidv4(),
        text: 'Chat encerrado pelo agente',
        kind: 'text',
        licensee: this.licensee._id,
        contact: contact._id,
        destination: 'to-messenger',
      })

      processedMessages.push(await messageToSend.save())
    } else {
      for (const message of responseBody.messages) {
        let text = message.attachments ? message.attachments[0].description : message.msg
        text = text ? emoji.replace(text) : ''

        const messageToSend = new Message({
          number: uuidv4(),
          text,
          kind: 'text',
          licensee: this.licensee._id,
          contact: contact._id,
          destination: 'to-messenger',
        })

       if (message.attachments) {
         messageToSend.kind = 'file'
         messageToSend.url = message.fileUpload.publicFilePath
         messageToSend.fileName = message.attachments[0].title
       }

        processedMessages.push(await messageToSend.save())
      }
    }

    return processedMessages
  }

  async transfer(messageId, url, token) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    const contact = await Contact.findById(messageToSend.contact._id)

    contact.talkingWithChatBot = false
    await contact.save()

    await this.sendMessage(messageId, url, token)
  }

  async sendMessage(messageId, url) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    let roomId = messageToSend.contact.roomId

    if (!roomId) {
      if (await this.#createVisitor(messageToSend.contact, url) === true) {
        roomId = await this.#createRoom(messageToSend.contact, url)
        if (roomId) {
          const contact = await Contact.findById(messageToSend.contact._id)

          contact.roomId = roomId
          await contact.save()
        } else {
          return
        }
      } else {
        return
      }
    }

    if (await this.#postMessage(messageToSend.contact, messageToSend, roomId, url)) {
      messageToSend.sended = true
      await messageToSend.save()
    }
  }

  async #createVisitor(contact, url) {
    const body = {
      visitor: {
        name: `${contact.name} - ${contact.number} - WhatsApp`,
        email: `${contact.email}`,
        token: `${contact.number}${contact.type}`
      }
    }

    const response = await request.post(`${url}/api/v1/livechat/visitor`, { body })

    if (response.data.success !== true) {
      console.error(`Não foi possível criar o visitante na Rocketchat ${JSON.stringify(response.data)}`)
    }

    return response.data.success === true
  }

  async #createRoom(contact, url) {
    const response = await request.get(`${url}/api/v1/livechat/room?token=${contact.number}${contact.type}`)

    if (response.data.success !== true) {
      console.error(`Não foi possível criar a sala na Rocketchat ${JSON.stringify(response.data)}`)
      return
    }

    return response.data.room._id
  }

  async #postMessage(contact, message, roomId, url) {
    const body = {
      token: `${contact.number}${contact.type}`,
      rid: roomId,
      msg: this.#formatMessage(message, contact)
    }

    const response = await request.post(`${url}/api/v1/livechat/message`, { body })
    if (response.data.success === true) {
      console.info(`Mensagem ${message._id} enviada para Rocketchat com sucesso!`)
    } else {
      console.error(`Mensagem ${message._id} não enviada para a Rocketchat ${JSON.stringify(response.data)}`)
    }

    return response.data.success === true
  }

  #formatMessage(message, contact) {
    return contact.type === '@c.us' ? message.text : `*${contact.name}:*\n${message.text}`
  }

  async closeChat(messageId, licensee) {
    const message = await Message.findById(messageId).populate('contact')
    const contact = await Contact.findById(message.contact._id)

    contact.roomId = ''
    if (licensee.useChatbot) {
      contact.talkingWithChatBot = true
    }
    await contact.save()
  }
}

module.exports = Rocketchat
