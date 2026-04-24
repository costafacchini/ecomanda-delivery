import { ContactRepositoryDatabase } from '../../repositories/contact.js'
import { CartRepositoryDatabase } from '../../repositories/cart.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'
import { TriggerRepositoryDatabase } from '../../repositories/trigger.js'
import { ProductRepositoryDatabase } from '../../repositories/product.js'
import Repository from '../../repositories/repository.js'
import { v4 as uuidv4 } from 'uuid'
import { S3 } from '../storage/S3.js'

const uploadFile = (licensee, contact, fileName, fileBase64) => {
  const s3 = new S3(licensee, contact, fileName, fileBase64)
  s3.uploadFile()

  return s3.presignedUrl()
}

class MessengersBase {
  constructor(
    licensee,
    { contactRepository, cartRepository, messageRepository, triggerRepository, productRepository } = {},
  ) {
    this.licensee = licensee
    this._contactRepository = contactRepository
    this._cartRepository = cartRepository
    this._messageRepository = messageRepository
    this._triggerRepository = triggerRepository
    this._productRepository = productRepository
  }

  get contactRepository() {
    this._contactRepository ??= new ContactRepositoryDatabase()
    if (typeof this._contactRepository.save !== 'function') {
      this._contactRepository.save = Repository.prototype.save.bind(this._contactRepository)
    }
    return this._contactRepository
  }

  get cartRepository() {
    this._cartRepository ??= new CartRepositoryDatabase()
    if (typeof this._cartRepository.save !== 'function') {
      this._cartRepository.save = Repository.prototype.save.bind(this._cartRepository)
    }
    return this._cartRepository
  }

  get messageRepository() {
    this._messageRepository ??= new MessageRepositoryDatabase()
    if (typeof this._messageRepository.save !== 'function') {
      this._messageRepository.save = Repository.prototype.save.bind(this._messageRepository)
    }
    return this._messageRepository
  }

  get triggerRepository() {
    this._triggerRepository ??= new TriggerRepositoryDatabase()
    return this._triggerRepository
  }

  get productRepository() {
    this._productRepository ??= new ProductRepositoryDatabase()
    return this._productRepository
  }

  // eslint-disable-next-line require-await
  async getMediaUrl(_mediaId, _url, _token, _contact) {
    // Método padrão que pode ser sobrescrito pelas classes filhas
    // Retorna null se não for implementado
    return null
  }

  async findContact(number, type) {
    return await this.contactRepository.findFirst({
      number: number,
      type: type,
      licensee: this.licensee._id,
    })
  }

  async responseToMessages(responseBody) {
    this.parseMessageStatus(responseBody)
    if (this.messageStatus) {
      const message = await this.messageRepository.findFirst({
        licensee: this.licensee._id,
        messageWaId: this.messageStatus.id,
      })

      if (message) {
        if (this.messageStatus.status === 'sent') message.sendedAt = new Date()
        if (this.messageStatus.status === 'delivered') message.deliveredAt = new Date()
        if (this.messageStatus.status === 'read') message.readAt = new Date()

        await this.messageRepository.save(message)
      }

      return []
    }

    this.parseContactData(responseBody)
    this.parseMessage(responseBody)

    if (!this.contactData) return []

    let contact = await this.findContact(this.contactData.number, this.contactData.type)
    if (!contact) {
      contact = await this.contactRepository.create({
        name: this.contactData.name,
        number: this.contactData.number,
        type: this.contactData.type,
        talkingWithChatBot: this.licensee.useChatbot,
        waId: this.contactData.waId,
        licensee: this.licensee._id,
        wa_start_chat: this.contactData.wa_start_chat,
      })
    } else {
      if (this.contactWithDifferentData(contact)) {
        contact.name = this.contactData.name
        contact.waId = this.contactData.waId
        contact.talkingWithChatBot = this.licensee.useChatbot

        await this.contactRepository.save(contact)
      }
      if (this.shouldUpdateWaStartChat(contact)) {
        contact.wa_start_chat = this.contactData.wa_start_chat

        await this.contactRepository.save(contact)
      }
    }

    if (!this.messageData) return []

    const processedMessages = []

    if (this.messageData.kind === 'interactive') {
      const triggers = await this.triggerRepository.find(
        { expression: this.messageData.interactive.expression, licensee: this.licensee._id },
        { order: 'asc' },
      )
      if (triggers.length > 0) {
        for (const trigger of triggers) {
          processedMessages.push(
            await this.messageRepository.create({
              number: uuidv4(),
              messageWaId: this.messageData.waId,
              licensee: this.licensee._id,
              contact: contact._id,
              destination: 'to-messenger',
              kind: 'interactive',
              trigger: trigger._id,
            }),
          )
        }
      } else {
        processedMessages.push(
          await this.messageRepository.create({
            number: uuidv4(),
            messageWaId: this.messageData.waId,
            licensee: this.licensee._id,
            contact: contact._id,
            destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
            text: this.messageData.interactive.expression,
          }),
        )
      }
    } else {
      const messageToSend = {
        number: uuidv4(),
        messageWaId: this.messageData.waId,
        licensee: this.licensee._id,
        contact: contact._id,
        destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
        kind: this.messageData.kind,
        departament: this.messageData.departament,
      }

      if (messageToSend.kind === 'text') {
        messageToSend.text = this.messageData.text.body
      } else if (messageToSend.kind === 'order') {
        messageToSend.kind = 'cart'
        messageToSend.destination = 'to-chatbot'

        let cart = await this.cartRepository.findFirst({ contact, concluded: false })
        if (!cart) {
          cart = {
            licensee: this.licensee._id,
            contact: contact._id,
          }

          cart = await this.cartRepository.create(cart)
        }

        const products = []
        for (const item of this.messageData.order.productItems) {
          const product = await this.productRepository.findFirst({
            product_retailer_id: item.product_retailer_id,
            licensee: this.licensee._id,
          })

          products.push({
            unit_price: item.item_price,
            name: product?.name,
            product_retailer_id: item.product_retailer_id,
            quantity: item.quantity,
            product,
          })
        }

        cart.delivery_tax = 0
        cart.catalog = this.messageData.order.catalogId
        cart.note = this.messageData.order.text
        cart.products = products

        messageToSend.cart = await this.cartRepository.save(cart)
      } else if (messageToSend.kind === 'location') {
        messageToSend.latitude = this.messageData.latitude
        messageToSend.longitude = this.messageData.longitude
      } else {
        messageToSend.attachmentWaId = this.messageData.file.id
        messageToSend.fileName = this.messageData.file.fileName

        if (this.messageData.file.url) {
          messageToSend.url = this.messageData.file.url
        } else if (this.messageData.file.fileBase64) {
          messageToSend.url = await uploadFile(
            this.licensee,
            contact,
            this.messageData.file.fileName,
            this.messageData.file.fileBase64,
          )
        } else {
          messageToSend.url = await this.getMediaUrl(
            messageToSend.attachmentWaId,
            this.licensee.whatsappUrl,
            this.licensee.whatsappToken,
            contact,
          )
        }
      }

      if (this.messageData.sender) messageToSend.senderName = this.messageData.sender
      if (this.messageData.replyMessageId) messageToSend.replyMessageId = this.messageData.replyMessageId

      try {
        processedMessages.push(await this.messageRepository.create(messageToSend))
      } catch (error) {
        console.error('Não consegui criar a mensagem, verifique os erros:', error)
      }
    }

    return processedMessages
  }
}

export { MessengersBase }
