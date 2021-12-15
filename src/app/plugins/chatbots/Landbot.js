const emoji = require('../../helpers/Emoji')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const request = require('../../services/request')
const Room = require('@models/Room')
const Trigger = require('@models/Trigger')

const closeRoom = async (contact) => {
  const room = await Room.findOne({ contact: contact._id, closed: false })
  if (room) {
    room.closed = true
    await room.save()
  }
}

class Landbot {
  constructor(licensee) {
    this.licensee = licensee
  }

  async responseToMessages(responseBody) {
    const { customer, messages } = responseBody

    if (!customer || !messages) return []

    const normalizePhone = new NormalizePhone(customer.number)

    const contact = await Contact.findOne({
      number: normalizePhone.number,
      type: normalizePhone.type,
      licensee: this.licensee._id,
    })

    if (!contact) {
      console.info(`Contato com telefone ${normalizePhone.number} e licenciado ${this.licensee._id} não encontrado`)
      return []
    }

    if (contact.landbotId !== customer.id) {
      contact.landbotId = customer.id
      await contact.save()
    }

    const processedMessages = []
    for (const message of messages) {
      const kind = Landbot.kindToMessageKind(message.type)

      if (!kind) {
        console.info(`Tipo de mensagem retornado pela Landbot não reconhecido: ${message.type}`)
        continue
      }

      // .replace(/%first_name%/i, customer.name)
      const text = emoji.replace(message.message)

      const messageToSend = new Message({
        number: uuidv4(),
        text,
        kind,
        licensee: this.licensee._id,
        contact: contact._id,
        destination: 'to-messenger',
      })

      if (kind === 'text') {
        const trigger = await Trigger.findOne({ expression: text, licensee: this.licensee._id })
        if (trigger) {
          messageToSend.kind = 'interactive'
          messageToSend.trigger = trigger._id
        }
      }

      if (kind === 'file') {
        messageToSend.url = message.url
        messageToSend.fileName = message.url.match(/[^\\/]+$/)[0]
      }

      if (kind === 'location') {
        messageToSend.latitude = message.latitude
        messageToSend.longitude = message.longitude
      }

      processedMessages.push(await messageToSend.save())
    }

    return processedMessages
  }

  static kindToMessageKind(kind) {
    switch (kind) {
      case 'text':
        return 'text'
      case 'image':
        return 'file'
      case 'document':
        return 'file'
      case 'location':
        return 'location'
      default:
        return undefined
    }
  }

  async responseTransferToMessage(responseBody) {
    const { name, email, number, observacao, id_departamento_rocketchat, iniciar_nova_conversa } = responseBody

    if (!number) return

    const normalizePhone = new NormalizePhone(number)

    const contact = await Contact.findOne({
      number: normalizePhone.number,
      type: normalizePhone.type,
      licensee: this.licensee._id,
    })

    if (!contact) {
      console.info(`Contato com telefone ${normalizePhone.number} e licenciado ${this.licensee._id} não encontrado`)
      return
    }

    if (name || email) {
      if (name && name !== contact.name) {
        contact.name = name
      }

      if (email && email !== contact.email) {
        contact.email = email
      }

      await contact.save()
    }

    if (iniciar_nova_conversa && iniciar_nova_conversa === 'true') {
      await closeRoom(contact)
    }

    const message = new Message({
      number: uuidv4(),
      text: observacao,
      kind: 'text',
      licensee: this.licensee._id,
      contact: contact._id,
      destination: 'to-transfer',
      departament: id_departamento_rocketchat,
    })

    return await message.save()
  }

  async sendMessage(messageId, url, token) {
    const messageToSend = await Message.findById(messageId).populate('contact')

    const customer = {
      name: messageToSend.contact.name,
      number: messageToSend.contact.number,
      email: messageToSend.contact.email,
      type: messageToSend.contact.type,
      licensee: messageToSend.licensee._id,
    }

    const body = {
      customer,
      message: {
        type: 'text',
        message: messageToSend.text,
        payload: '$1',
      },
    }

    const headers = {
      Authorization: `Token ${token}`,
    }

    const response = await request.post(`${url}/${customer.number}/`, { headers, body })

    if (response.status === 201) {
      messageToSend.sended = true
      await messageToSend.save()
      console.info(
        `Mensagem ${messageToSend._id} enviada para Landbot com sucesso!
           status: ${response.status}
           body: ${JSON.stringify(response.data)}`
      )
    } else {
      messageToSend.error = JSON.stringify(response.data)
      await messageToSend.save()
      console.error(
        `Mensagem ${messageToSend._id} não enviada para Landbot.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`
      )
    }
  }

  async dropConversation(contactId) {
    const contact = await Contact.findById(contactId)

    const headers = {
      Authorization: `Token ${this.licensee.chatbotApiToken}`,
    }

    const response = await request.delete(`https://api.landbot.io/v1/customers/${contact.landbotId}/`, { headers })

    return response.status === 204
  }
}

module.exports = Landbot
