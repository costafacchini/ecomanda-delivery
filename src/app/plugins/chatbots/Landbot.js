import { replace } from '../../helpers/Emoji.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import { v4 as uuidv4 } from 'uuid'
import request from '../../services/request.js'
import Room from '../../models/Room.js'
import Trigger from '../../models/Trigger.js'
import { createCartPlugin } from '../../plugins/carts/factory.js'
import { isPhoto, isVideo, isMidia, isVoice } from '../../helpers/Files.js'
import { ContactRepositoryDatabase } from '../../repositories/contact.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'

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

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.findFirst({
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

      if (kind === 'text' && !message.message) {
        continue
      }

      const text = replace(message.message)

      const messageRepository = new MessageRepositoryDatabase()
      if (kind === 'text') {
        const triggers = await Trigger.find({ expression: text, licensee: this.licensee._id }).sort({ order: 'asc' })
        if (triggers.length > 0) {
          for (const trigger of triggers) {
            processedMessages.push(
              await messageRepository.create({
                number: uuidv4(),
                text,
                kind: 'interactive',
                licensee: this.licensee._id,
                contact: contact._id,
                destination: 'to-messenger',
                trigger: trigger._id,
              }),
            )
          }
        } else {
          processedMessages.push(
            await messageRepository.create({
              number: uuidv4(),
              text,
              kind,
              licensee: this.licensee._id,
              contact: contact._id,
              destination: 'to-messenger',
            }),
          )
        }
      } else {
        const messageToSend = {
          number: uuidv4(),
          text,
          kind,
          licensee: this.licensee._id,
          contact: contact._id,
          destination: 'to-messenger',
        }

        if (kind === 'file') {
          messageToSend.url = message.url
          messageToSend.fileName = message.url.match(/[^\\/]+$/)[0]
        }

        if (kind === 'location') {
          messageToSend.latitude = message.latitude
          messageToSend.longitude = message.longitude
        }

        processedMessages.push(await messageRepository.create(messageToSend))
      }
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

    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.findFirst({
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

    const messageRepository = new MessageRepositoryDatabase()
    return await messageRepository.create({
      number: uuidv4(),
      text: observacao,
      kind: 'text',
      licensee: this.licensee._id,
      contact: contact._id,
      destination: 'to-transfer',
      departament: id_departamento_rocketchat,
    })
  }

  async sendMessage(messageId, url, token) {
    const messageRepository = new MessageRepositoryDatabase()
    const messageToSend = await messageRepository.findFirst({ _id: messageId }, ['contact'])

    const customer = {
      name: messageToSend.contact.name,
      number: messageToSend.contact.number,
      email: messageToSend.contact.email,
      type: messageToSend.contact.type,
      licensee: messageToSend.licensee._id,
    }

    const body = {
      customer,
      message: {},
    }

    if (messageToSend.kind === 'file') {
      body.message.url = messageToSend.url

      if (isPhoto(messageToSend.url)) body.message.type = 'image'
      if (isVideo(messageToSend.url)) body.message.type = 'video'
      if (isMidia(messageToSend.url) || isVoice(messageToSend.url)) body.message.type = 'audio'
      if (!body.message.type) body.message.type = 'document'
    } else if (messageToSend.kind === 'location') {
      body.message.type = 'location'
      body.message.latitude = messageToSend.latitude
      body.message.longitude = messageToSend.longitude
    } else {
      body.message.type = 'text'
      body.message.message = messageToSend.text
      body.message.payload = '$1'

      if (messageToSend.kind === 'cart') {
        const cartPlugin = createCartPlugin(this.licensee)
        const cartTransformed = await cartPlugin.transformCart(this.licensee, messageToSend.cart)

        body.message.message = JSON.stringify(cartTransformed)
      }
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
           body: ${JSON.stringify(response.data)}`,
      )
    } else {
      messageToSend.error = JSON.stringify(response.data)
      await messageToSend.save()
      console.error(
        `Mensagem ${messageToSend._id} não enviada para Landbot.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`,
      )
    }
  }

  async dropConversation(contactId) {
    const contactRepository = new ContactRepositoryDatabase()
    const contact = await contactRepository.findFirst({ _id: contactId })

    const headers = {
      Authorization: `Token ${this.licensee.chatbotApiToken}`,
    }

    const response = await request.delete(`https://api.landbot.io/v1/customers/${contact.landbotId}/`, { headers })

    return response.status === 204
  }
}

export { Landbot }
