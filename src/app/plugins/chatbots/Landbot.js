import { replace } from '../../helpers/Emoji.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import { v4 as uuidv4 } from 'uuid'
import request from '../../services/request.js'
import { createCartPlugin } from '../../plugins/carts/factory.js'
import { isPhoto, isVideo, isMidia, isVoice } from '../../helpers/Files.js'
import { ContactRepositoryDatabase } from '../../repositories/contact.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'
import { RoomRepositoryDatabase } from '../../repositories/room.js'
import { TriggerRepositoryDatabase } from '../../repositories/trigger.js'
import Repository from '../../repositories/repository.js'

const closeRoom = async (contact, roomRepository) => {
  const room = await roomRepository.findFirst({ contact: contact._id, closed: false })
  if (room) {
    room.closed = true
    await roomRepository.save(room)
  }
}

class Landbot {
  constructor(licensee, { contactRepository, messageRepository, roomRepository, triggerRepository } = {}) {
    this.licensee = licensee
    this._contactRepository = contactRepository
    this._messageRepository = messageRepository
    this._roomRepository = roomRepository
    this._triggerRepository = triggerRepository
  }

  get contactRepository() {
    this._contactRepository ??= new ContactRepositoryDatabase()
    if (typeof this._contactRepository.save !== 'function') {
      this._contactRepository.save = Repository.prototype.save.bind(this._contactRepository)
    }
    return this._contactRepository
  }

  get messageRepository() {
    this._messageRepository ??= new MessageRepositoryDatabase()
    if (typeof this._messageRepository.save !== 'function') {
      this._messageRepository.save = Repository.prototype.save.bind(this._messageRepository)
    }
    return this._messageRepository
  }

  get roomRepository() {
    this._roomRepository ??= new RoomRepositoryDatabase()
    if (typeof this._roomRepository.save !== 'function') {
      this._roomRepository.save = Repository.prototype.save.bind(this._roomRepository)
    }
    return this._roomRepository
  }

  get triggerRepository() {
    this._triggerRepository ??= new TriggerRepositoryDatabase()
    return this._triggerRepository
  }

  async responseToMessages(responseBody) {
    const { customer, messages } = responseBody

    if (!customer || !messages) return []

    const normalizePhone = new NormalizePhone(customer.number)

    const contact = await this.contactRepository.findFirst({
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
      await this.contactRepository.save(contact)
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

      if (kind === 'text') {
        const triggers = await this.triggerRepository.find(
          { expression: text, licensee: this.licensee._id },
          { order: 'asc' },
        )
        if (triggers.length > 0) {
          for (const trigger of triggers) {
            processedMessages.push(
              await this.messageRepository.create({
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
            await this.messageRepository.create({
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

        processedMessages.push(await this.messageRepository.create(messageToSend))
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

    const contact = await this.contactRepository.findFirst({
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

      await this.contactRepository.save(contact)
    }

    if (iniciar_nova_conversa && iniciar_nova_conversa === 'true') {
      await closeRoom(contact, this.roomRepository)
    }

    return await this.messageRepository.create({
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
    const messageToSend = await this.messageRepository.findFirst({ _id: messageId }, ['contact'])

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
      await this.messageRepository.save(messageToSend)
      console.info(
        `Mensagem ${messageToSend._id} enviada para Landbot com sucesso!
           status: ${response.status}
           body: ${JSON.stringify(response.data)}`,
      )
    } else {
      messageToSend.error = JSON.stringify(response.data)
      await this.messageRepository.save(messageToSend)
      console.error(
        `Mensagem ${messageToSend._id} não enviada para Landbot.
           status: ${response.status}
           mensagem: ${JSON.stringify(response.data)}`,
      )
    }
  }

  async dropConversation(contactId) {
    const contact = await this.contactRepository.findFirst({ _id: contactId })

    const headers = {
      Authorization: `Token ${this.licensee.chatbotApiToken}`,
    }

    const response = await request.delete(`https://api.landbot.io/v1/customers/${contact.landbotId}/`, { headers })

    return response.status === 204
  }
}

export { Landbot }
