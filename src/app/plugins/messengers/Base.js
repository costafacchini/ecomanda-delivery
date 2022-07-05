const Message = require('@models/Message')
const { createContact, getContactBy } = require('@repositories/contact')
const { getAllTriggerBy } = require('@repositories/trigger')
const { createMessage } = require('@repositories/message')
const { createCart, getCartBy } = require('@repositories/cart')
const { getProductBy } = require('@repositories/product')
const { v4: uuidv4 } = require('uuid')
const S3 = require('../storage/S3')
const request = require('../../services/request')
const mime = require('mime-types')

const getMediaURL = async (licensee, contact, { mediaWaId, fileName, fileBase64 }) => {
  if (mediaWaId) {
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
    return await getContactBy({
      number: number,
      type: type,
      licensee: this.licensee._id,
    })
  }

  async responseToMessages(responseBody) {
    this.parseMessageStatus(responseBody)
    if (this.messageStatus) {
      const message = await Message.findOne({
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

    this.parseMessage(responseBody)
    if (!this.messageData) return []

    const processedMessages = []

    this.parseContactData(responseBody)
    let contact = await this.findContact(this.contactData.number, this.contactData.type)
    if (!contact) {
      contact = await createContact({
        name: this.contactData.name,
        number: this.contactData.number,
        type: this.contactData.type,
        talkingWithChatBot: this.licensee.useChatbot,
        waId: this.contactData.waId,
        licensee: this.licensee._id,
      })
    } else {
      if (this.contactWithDifferentData(contact)) {
        contact.name = this.contactData.name
        contact.waId = this.contactData.waId
        contact.talkingWithChatBot = this.licensee.useChatbot

        await contact.save()
      }
    }

    if (this.messageData.kind === 'interactive') {
      const triggers = await getAllTriggerBy(
        { expression: this.messageData.interactive.expression, licensee: this.licensee._id },
        { order: 'asc' }
      )
      if (triggers.length > 0) {
        for (const trigger of triggers) {
          processedMessages.push(
            await createMessage({
              number: uuidv4(),
              messageWaId: this.messageData.waId,
              licensee: this.licensee._id,
              contact: contact._id,
              destination: 'to-messenger',
              kind: 'interactive',
              trigger: trigger._id,
            })
          )
        }
      } else {
        processedMessages.push(
          await createMessage({
            number: uuidv4(),
            messageWaId: this.messageData.waId,
            licensee: this.licensee._id,
            contact: contact._id,
            destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
            text: this.messageData.interactive.expression,
          })
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

        let cart = await getCartBy({ contact, concluded: false })
        if (!cart) {
          cart = {
            licensee: this.licensee._id,
            contact: contact._id,
          }

          cart = await createCart(cart)
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

        messageToSend.url = await getMediaURL(this.licensee, contact, {
          mediaWaId: messageToSend.attachmentWaId,
          fileName: this.messageData.file.fileName,
          fileBase64: this.messageData.file.fileBase64,
        })
      }

      if (this.messageData.sender) messageToSend.senderName = this.messageData.sender

      processedMessages.push(await createMessage(messageToSend))
    }

    return processedMessages
  }
}

module.exports = MessengersBase
