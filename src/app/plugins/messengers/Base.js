import { ContactRepositoryDatabase } from '../../repositories/contact.js'
import { getAllTriggerBy } from '../../repositories/trigger.js'
import { CartRepositoryDatabase } from '../../repositories/cart.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'
import { getProductBy } from '../../repositories/product.js'
import { v4 as uuidv4 } from 'uuid'
import { S3 } from '../storage/S3.js'
import request from '../../services/request.js'
import mime from 'mime-types'

const uploadMediaToS3 = async (licensee, contact, { mediaWaId, fileName, fileBase64 }) => {
  if (mediaWaId && licensee.whatsappDefault === 'dialog') {
    const response = await downloadMedia(mediaWaId, licensee.whatsappToken)
    const extension = mime.extension(response.headers.get('content-type'))
    const fileName = `${mediaWaId}.${extension}`
    const fileBase64 = Buffer.from(response.data).toString('base64')

    return uploadFile(licensee, contact, fileName, fileBase64)
  } else {
    return uploadFile(licensee, contact, fileName, fileBase64)
  }
}

const downloadMedia = async (mediaId, whatsappToken) => {
  const headers = { 'D360-API-KEY': whatsappToken }
  const response = await request.download(`https://waba.360dialog.io/v1/media/${mediaId}`, {
    headers,
  })

  return response
}

const uploadFile = (licensee, contact, fileName, fileBase64) => {
  const s3 = new S3(licensee, contact, fileName, fileBase64)
  s3.uploadFile()

  return s3.presignedUrl()
}

class MessengersBase {
  constructor(licensee) {
    this.licensee = licensee
  }

  async findContact(number, type) {
    const contactRepository = new ContactRepositoryDatabase()
    return await contactRepository.findFirst({
      number: number,
      type: type,
      licensee: this.licensee._id,
    })
  }

  async responseToMessages(responseBody) {
    const messageRepository = new MessageRepositoryDatabase()
    this.parseMessageStatus(responseBody)
    if (this.messageStatus) {
      const message = await messageRepository.findFirst({
        licensee: this.licensee._id,
        messageWaId: this.messageStatus.id,
      })

      if (message) {
        if (this.messageStatus.status === 'sent') message.sendedAt = new Date()
        if (this.messageStatus.status === 'delivered') message.deliveredAt = new Date()
        if (this.messageStatus.status === 'read') message.readAt = new Date()

        await message.save()
      }

      return []
    }

    this.parseContactData(responseBody)
    this.parseMessage(responseBody)

    if (!this.contactData) return []

    let contact = await this.findContact(this.contactData.number, this.contactData.type)
    if (!contact) {
      const contactRepository = new ContactRepositoryDatabase()
      contact = await contactRepository.create({
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

        await contact.save()
      }
      if (this.shouldUpdateWaStartChat(contact)) {
        contact.wa_start_chat = this.contactData.wa_start_chat

        await contact.save()
      }
    }

    if (!this.messageData) return []

    const processedMessages = []

    if (this.messageData.kind === 'interactive') {
      const triggers = await getAllTriggerBy(
        { expression: this.messageData.interactive.expression, licensee: this.licensee._id },
        { order: 'asc' },
      )
      if (triggers.length > 0) {
        for (const trigger of triggers) {
          processedMessages.push(
            await messageRepository.create({
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
          await messageRepository.create({
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
      }

      if (messageToSend.kind === 'text') {
        messageToSend.text = this.messageData.text.body
      } else if (messageToSend.kind === 'order') {
        messageToSend.kind = 'cart'
        messageToSend.destination = 'to-chatbot'

        const cartRepository = new CartRepositoryDatabase()
        let cart = await cartRepository.findFirst({ contact, concluded: false })
        if (!cart) {
          cart = {
            licensee: this.licensee._id,
            contact: contact._id,
          }

          cart = await cartRepository.create(cart)
        }

        const products = []
        for (const item of this.messageData.order.productItems) {
          const product = await getProductBy({
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

        messageToSend.cart = await cart.save()
      } else {
        messageToSend.attachmentWaId = this.messageData.file.id
        messageToSend.fileName = this.messageData.file.fileName

        if (this.messageData.file.url) {
          messageToSend.url = this.messageData.file.url
        } else if (this.messageData.file.fileBase64) {
          try {
            messageToSend.url = await uploadMediaToS3(this.licensee, contact, {
              mediaWaId: messageToSend.attachmentWaId,
              fileName: this.messageData.file.fileName,
              fileBase64: this.messageData.file.fileBase64,
            })
          } catch (error) {
            console.error('Erro no parse de payload de webhook tentando fazer upload do arquivo para o S3', error)

            return processedMessages
          }
        }
      }

      if (this.messageData.sender) messageToSend.senderName = this.messageData.sender

      processedMessages.push(await messageRepository.create(messageToSend))
    }

    return processedMessages
  }
}

export { MessengersBase }
