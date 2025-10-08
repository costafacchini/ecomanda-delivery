const request = require('../../services/request')
const ChatsBase = require('./Base')
const { createRoom, getRoomBy } = require('@repositories/room')
const path = require('path')
const mime = require('mime-types')

const searchContact = async (url, headers, contact, licensee, contactRepository) => {
  const response = await request.get(`${url}contacts/search?q=+${contact.number}`, { headers })

  if (response.status == 200 && response.data && response.data.payload && response.data.payload.length > 0) {
    const contactInbox = response.data.payload[0].contact_inboxes.find(
      (inbox) => inbox.inbox.id == licensee.chatIdentifier,
    )

    if (!contactInbox) {
      return null
    }

    await contactRepository.update(contact._id, {
      chatwootId: response.data.payload[0].id,
      chatwootSourceId: contactInbox.source_id,
    })

    return contactInbox.source_id
  } else {
    return null
  }
}

const createContact = async (url, headers, contact, licensee, contactRepository) => {
  const body = {
    name: contact.name,
    inbox_id: licensee.chatIdentifier,
    phone_number: `+${contact.number}`,
    email: contact.email,
    custom_attributes: {
      address: contact.address,
      address_number: contact.address_number,
      address_complement: contact.address_complement,
      neighborhood: contact.neighborhood,
      city: contact.city,
      cep: contact.cep,
      uf: contact.uf,
    },
  }

  //  TODO: implementar essa rota para criar o contato na inbox
  // https://chat.zibb.com.br/public/api/v1/inboxes/kawhk9sA6d58ohXRJ3AfPLe8/contacts
  // host + public/api/ + api version + /inboxes/ + inbox id + /contacts
  const response = await request.post(`${url}contacts`, { headers, body })

  if (!response.status == 200) {
    console.error(`Não foi possível criar o contato na Chatwoot ${JSON.stringify(response.data)}`)
    return
  } else if (response.data?.payload?.contact_inbox) {
    await contactRepository.update(contact._id, {
      chatwootId: response.data.payload.contact.id,
      chatwootSourceId: response.data.payload.contact_inbox.source_id,
    })

    return response.data.payload.contact_inbox.source_id
  } else {
    return null
  }
}

const createConversation = async (url, headers, contact) => {
  const body = {
    source_id: contact.chatwootSourceId,
    contact_id: contact.chatwootId,
    status: 'open',
  }

  const response = await request.post(`${url}conversations`, { headers, body })

  if (response.status !== 200) {
    console.error(`Não foi possível criar a conversa na Chatwoot ${JSON.stringify(response.data)}`)
    return
  } else {
    const room = await createRoom({
      roomId: response.data.id,
      contact: contact._id,
    })

    return room
  }
}

const postMessage = async (url, headers, contact, message, room) => {
  let requestOptions = {
    headers: { ...headers },
  }

  if (message.kind === 'text') {
    const body = {
      private: false,
      message_type: 'incoming',
      content_type: 'text',
      content: formatMessage(message, contact),
    }

    requestOptions.body = body
  } else if (message.kind === 'file') {
    const fileResponse = await request.download(message.url)

    if (!fileResponse || !fileResponse.data) {
      console.error('Erro: fileResponse ou fileResponse.data é null/undefined', fileResponse)
      message.error = 'Erro ao baixar arquivo: resposta inválida'
      await message.save()
      return false
    }

    const fileName = path.basename(message.url.split('?')[0]) || 'file'
    const contentType =
      (fileResponse.headers && fileResponse.headers.get && fileResponse.headers.get('content-type')) ||
      mime.lookup(fileName) ||
      'application/octet-stream'

    const fileBuffer = Buffer.from(fileResponse.data)

    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2)
    requestOptions.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`

    let multipartBody = ''

    multipartBody += `--${boundary}\r\n`
    multipartBody += 'Content-Disposition: form-data; name="private"\r\n\r\n'
    multipartBody += 'false\r\n'

    multipartBody += `--${boundary}\r\n`
    multipartBody += 'Content-Disposition: form-data; name="message_type"\r\n\r\n'
    multipartBody += 'incoming\r\n'

    multipartBody += `--${boundary}\r\n`
    multipartBody += `Content-Disposition: form-data; name="attachments[]"; filename="${fileName}"\r\n`
    multipartBody += `Content-Type: ${contentType}\r\n\r\n`

    const headerBuffer = Buffer.from(multipartBody, 'utf8')
    const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')

    multipartBody = Buffer.concat([headerBuffer, fileBuffer, footerBuffer])

    requestOptions.body = multipartBody
  } else {
    const body = {
      private: false,
      message_type: 'incoming',
      content_type: 'form',
    }

    requestOptions.body = body
  }

  const response = await request.post(`${url}conversations/${room.roomId}/messages`, requestOptions)

  if (response.status === 200) {
    message.sended = true
    await message.save()

    console.info(`Mensagem ${message._id} enviada para Chatwoot com sucesso!`)
  } else {
    message.error = `mensagem: ${JSON.stringify(response.data)}`
    await message.save()
    console.error(
      `Mensagem ${message._id} não enviada para Chatwoot.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`,
    )
  }

  return response.data.success === true
}

const formatMessage = (message, contact) => {
  const text = message.text

  return contact.type === '@c.us' ? text : `*${message.senderName}:*\n${text}`
}

class Chatwoot extends ChatsBase {
  constructor(licensee) {
    super(licensee)
  }

  action(responseBody) {
    if (responseBody.event === 'conversation_status_changed' && responseBody.status === 'resolved') {
      return 'close-chat'
    } else {
      return 'send-message-to-messenger'
    }
  }

  async parseMessage(responseBody) {
    if (responseBody.event === 'conversation_status_changed' && responseBody.status === 'resolved') {
      if (!responseBody.contact_inbox?.contact_id) {
        this.messageParsed = null
        return
      }

      const contact = await this.findContact({ chatwootId: responseBody.contact_inbox.contact_id })
      if (!contact) {
        this.messageParsed = null
        return
      }

      let room = await getRoomBy({ roomId: responseBody.id })
      if (!room) {
        this.messageParsed = null
        return
      }

      this.messageParsed = { room }
      this.messageParsed.contact = contact
      this.messageParsed.action = this.action(responseBody)
      this.messageParsed.messages = []
      return
    }

    if (responseBody.event !== 'message_created' || responseBody.message_type !== 'outgoing') {
      this.messageParsed = null
      return
    }

    if (!responseBody.conversation?.contact_inbox?.contact_id) {
      this.messageParsed = null
      return
    }

    const contact = await this.findContact({ chatwootId: responseBody.conversation.contact_inbox.contact_id })
    if (!contact) {
      this.messageParsed = null
      return
    }

    let room = await getRoomBy({ roomId: responseBody.conversation.id })
    if (!room) {
      room = await createRoom({ roomId: responseBody.conversation.id, contact: contact })
      this.messageParsed = null
      return
    }

    this.messageParsed = { room }
    this.messageParsed.contact = contact
    this.messageParsed.action = this.action(responseBody)

    const messagesToSend = []

    const senderName = responseBody.conversation.meta?.assignee?.available_name

    responseBody.conversation.messages?.forEach((message) => {
      if (message.content) {
        const messageToSend = {}
        messageToSend.text = { body: message.content }
        messageToSend.kind = 'text'
        if (senderName) {
          messageToSend.senderName = senderName
        }
        messagesToSend.push(messageToSend)
      }

      if (message.attachments?.length > 0) {
        message.attachments.forEach((attachment) => {
          const messageToSend = {}
          messageToSend.kind = 'file'
          messageToSend.file = {
            fileName: attachment.file_type,
            url: attachment.data_url,
          }
          messagesToSend.push(messageToSend)
        })
      }
    })

    this.messageParsed.messages = messagesToSend
  }

  async transfer(messageId, url) {
    const messageToSend = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])
    const contact = await this.contactRepository.findFirst({ _id: messageToSend.contact._id })

    contact.talkingWithChatBot = false
    await contact.save()

    await this.sendMessage(messageId, url)
  }

  async sendMessage(messageId, url) {
    const messageToSend = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])
    const headers = { api_access_token: this.licensee.chatKey, 'Content-Type': 'application/json' }

    if (!messageToSend.contact.chatwootSourceId) {
      const sourceId = await searchContact(url, headers, messageToSend.contact, this.licensee, this.contactRepository)
      if (!sourceId) {
        messageToSend.contact.chatwootSourceId = await createContact(
          url,
          headers,
          messageToSend.contact,
          this.licensee,
          this.contactRepository,
        )
      } else {
        messageToSend.contact.chatwootSourceId = sourceId
      }
    }

    if (!messageToSend.contact.chatwootSourceId) {
      console.error(`Não foi possível criar o contato na Chatwoot e o envio da mensagem foi abortado!`)
      return
    }

    const openRoom = await getRoomBy({ contact: messageToSend.contact, closed: false })
    let room = openRoom

    if (!room) {
      room = await createConversation(url, headers, messageToSend.contact, this.licensee)
      if (!room) {
        return
      }
    }

    await postMessage(url, headers, messageToSend.contact, messageToSend, room)
  }

  async closeChat(messageId) {
    const message = await this.messageRepository.findFirst({ _id: messageId }, ['contact', 'licensee', 'room'])
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
      await contact.save()
    }

    return messages
  }
}

module.exports = Chatwoot
