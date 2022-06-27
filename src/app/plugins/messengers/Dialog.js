const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Trigger = require('@models/Trigger')
const Cart = require('@models/Cart')
const Product = require('@models/Product')
const NormalizePhone = require('@helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const S3 = require('../storage/S3')
const request = require('../../services/request')
const files = require('@helpers/Files')
const mime = require('mime-types')
const cartFactory = require('../../plugins/carts/factory')
const { parseText } = require('@helpers/ParseTriggerText')

const getMediaURL = async (licensee, mediaId, contact) => {
  const response = await downloadMedia(mediaId, licensee.whatsappToken)
  const extension = mime.extension(response.headers.get('content-type'))

  return uploadFile(licensee, contact, `${mediaId}.${extension}`, Buffer.from(response.data).toString('base64'))
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

const getContact = async (number, url, token) => {
  const headers = { 'D360-API-KEY': token }

  const body = {
    blocking: 'wait',
    contacts: [`+${number}`],
    force_check: true,
  }

  const response = await request.post(`${url}v1/contacts/`, { headers, body })

  return {
    valid: response.status === 200 && response.data.contacts[0].status === 'valid',
    waId: response.data.contacts[0].wa_id,
    data: response.data,
  }
}

const getTemplates = async (url, token) => {
  const headers = { 'D360-API-KEY': token }

  const response = await request.get(`${url}v1/configs/templates`, { headers })

  return response.data
}

const parseTemplates = (dialogTemplates, licenseeId) => {
  const templates = []
  for (const template of dialogTemplates.waba_templates) {
    const templateValues = {
      name: template.name,
      namespace: template.namespace,
      licensee: licenseeId,
      language: template.language,
      active: template.status === 'approved',
      category: template.category,
      headerParams: [],
      bodyParams: [],
      footerParams: [],
    }
    template.components.forEach((component) => {
      const type = component.type.toLowerCase()
      if (component.format) {
        const format = component.format
        templateValues[`${type}Params`].push({ format })
      } else if (component.text) {
        const regex = /\{\{([0-9]*)\}\}/g
        const matches = component.text.match(regex)
        if (matches) {
          matches.forEach((match) => {
            const number = match.replace(/\D/g, '')
            templateValues[`${type}Params`].push({ number, format: 'text' })
          })
        }
      }
    })

    templates.push(templateValues)
  }

  return templates
}

class Dialog {
  constructor(licensee) {
    this.licensee = licensee
  }

  action(messageDestination) {
    if (messageDestination === 'to-chat') {
      return 'send-message-to-chat'
    } else if (messageDestination === 'to-messenger') {
      return 'send-message-to-messenger'
    } else {
      return 'send-message-to-chatbot'
    }
  }

  async responseToMessages(responseBody) {
    if (responseBody.statuses) {
      const status = responseBody.statuses[0]
      const message = await Message.findOne({
        licensee: this.licensee._id,
        messageWaId: status.id,
      })

      if (message) {
        if (status.status === 'sent') message.sendedAt = new Date()
        if (status.status === 'delivered') message.deliveredAt = new Date()
        if (status.status === 'read') message.readAt = new Date()

        await message.save()
      }

      return []
    }

    if (!responseBody.messages) return []

    const processedMessages = []

    const chatId = responseBody.messages[0].from
    const normalizePhone = new NormalizePhone(chatId)
    let contact = await Contact.findOne({
      number: normalizePhone.number,
      type: normalizePhone.type,
      licensee: this.licensee._id,
    })

    if (!contact) {
      contact = new Contact({
        name: responseBody.contacts[0].profile.name,
        number: normalizePhone.number,
        type: normalizePhone.type,
        talkingWithChatBot: this.licensee.useChatbot,
        waId: responseBody.contacts[0].wa_id,
        licensee: this.licensee._id,
      })
      await contact.save()
    } else {
      if (
        (responseBody.contacts[0].profile.name && contact.name !== responseBody.contacts[0].profile.name) ||
        (responseBody.contacts[0].wa_id && contact.waId !== responseBody.contacts[0].wa_id)
      ) {
        contact.name = responseBody.contacts[0].profile.name
        contact.waId = responseBody.contacts[0].wa_id
        contact.talkingWithChatBot = this.licensee.useChatbot
        await contact.save()
      }
    }

    if (responseBody.messages[0].type === 'interactive') {
      const expression = responseBody.messages[0].interactive.list_reply
        ? responseBody.messages[0].interactive.list_reply.id
        : responseBody.messages[0].interactive.button_reply.id

      const triggers = await Trigger.find({ expression, licensee: this.licensee._id }).sort({ order: 'asc' })
      if (triggers.length > 0) {
        for (const trigger of triggers) {
          const messageToSend = new Message({
            number: uuidv4(),
            messageWaId: responseBody.messages[0].id,
            licensee: this.licensee._id,
            contact: contact._id,
            destination: 'to-messenger',
            kind: 'interactive',
            trigger: trigger._id,
          })

          processedMessages.push(await messageToSend.save())
        }
      } else {
        const messageToSend = new Message({
          number: uuidv4(),
          messageWaId: responseBody.messages[0].id,
          licensee: this.licensee._id,
          contact: contact._id,
          destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
          text: expression,
        })

        processedMessages.push(await messageToSend.save())
      }
    } else {
      const messageToSend = new Message({
        number: uuidv4(),
        messageWaId: responseBody.messages[0].id,
        licensee: this.licensee._id,
        contact: contact._id,
        destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
      })

      if (responseBody.messages[0].type === 'text') {
        messageToSend.text = responseBody.messages[0].text.body
        messageToSend.kind = 'text'
        if (messageToSend.text.includes('{{') && messageToSend.text.includes('}}')) {
          messageToSend.kind = 'template'
        }
      } else if (responseBody.messages[0].type === 'order') {
        let cart = await Cart.findOne({ contact, concluded: false })
        if (!cart) {
          cart = new Cart({
            licensee: this.licensee._id,
            contact: contact._id,
          })
        }

        const products = []
        for (const item of responseBody.messages[0].order.product_items) {
          const product = await Product.findOne({
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
        cart.catalog = responseBody.messages[0].order.catalog_id
        cart.note = responseBody.messages[0].order.text
        cart.products = products

        await cart.save()

        messageToSend.kind = 'cart'
        messageToSend.cart = cart._id
        messageToSend.destination = 'to-chatbot'
      } else {
        if (responseBody.messages[0].type === 'image') {
          messageToSend.attachmentWaId = responseBody.messages[0].image.id
          messageToSend.fileName = responseBody.messages[0].image.sha256
        } else if (responseBody.messages[0].type === 'video') {
          messageToSend.attachmentWaId = responseBody.messages[0].video.id
          messageToSend.fileName = responseBody.messages[0].video.sha256
        } else if (responseBody.messages[0].type === 'voice') {
          messageToSend.attachmentWaId = responseBody.messages[0].voice.id
          messageToSend.fileName = responseBody.messages[0].voice.sha256
        } else if (responseBody.messages[0].type === 'audio') {
          messageToSend.attachmentWaId = responseBody.messages[0].audio.id
          messageToSend.fileName = responseBody.messages[0].audio.sha256
        } else if (responseBody.messages[0].type === 'document') {
          messageToSend.attachmentWaId = responseBody.messages[0].document.id
          messageToSend.fileName = responseBody.messages[0].document.filename
        }

        messageToSend.kind = 'file'
        messageToSend.url = await getMediaURL(this.licensee, messageToSend.attachmentWaId, contact)
      }

      processedMessages.push(await messageToSend.save())
    }

    return processedMessages
  }

  async sendMessage(messageId, url, token) {
    const messageToSend = await Message.findById(messageId).populate('contact')

    const waContact = await getContact(messageToSend.contact.number, url, token)
    if (waContact.valid) {
      const headers = { 'D360-API-KEY': token }

      const messageBody = {
        recipient_type: 'individual',
        to: waContact.waId,
      }

      if (messageToSend.kind === 'text') {
        messageBody.type = 'text'
        messageBody.text = {
          body: messageToSend.text,
        }
      }

      if (messageToSend.kind === 'interactive') {
        const trigger = await Trigger.findById(messageToSend.trigger)
        if (trigger) {
          messageBody.type = 'interactive'
          if (trigger.triggerKind === 'multi_product') {
            messageBody.interactive = JSON.parse(trigger.catalogMulti)
          }
          if (trigger.triggerKind === 'single_product') {
            messageBody.interactive = JSON.parse(trigger.catalogSingle)
          }
          if (trigger.triggerKind === 'reply_button') {
            messageBody.interactive = JSON.parse(trigger.textReplyButton)
          }
          if (trigger.triggerKind === 'list_message') {
            messageBody.interactive = JSON.parse(trigger.messagesList)
          }
          if (trigger.triggerKind === 'text') {
            messageBody.type = 'text'
            messageBody.text = {
              body: await parseText(trigger.text, messageToSend.contact),
            }
          }
        } else {
          messageBody.type = 'text'
          messageBody.text = {
            body: messageToSend.text,
          }
        }
      }

      if (messageToSend.kind === 'file') {
        if (files.isPhoto(messageToSend.url)) {
          messageBody.type = 'image'
          messageBody.image = {
            link: messageToSend.url,
          }
        } else if (files.isVideo(messageToSend.url)) {
          messageBody.type = 'video'
          messageBody.video = {
            link: messageToSend.url,
          }
        } else if (files.isMidia(messageToSend.url) || files.isVoice(messageToSend.url)) {
          messageBody.type = 'audio'
          messageBody.audio = {
            link: messageToSend.url,
          }
        } else {
          messageBody.type = 'document'
          messageBody.document = {
            link: messageToSend.url,
            filename: messageToSend.fileName,
          }
        }
      }

      if (messageToSend.kind === 'location') {
        messageBody.type = 'location'
        messageBody.location = {
          longitude: messageToSend.longitude,
          latitude: messageToSend.latitude,
        }
      }

      if (messageToSend.kind === 'cart') {
        const cartPlugin = cartFactory(this.licensee)
        const cartTransformed = await cartPlugin.transformCart(this.licensee, messageToSend.cart)

        messageBody.type = 'text'
        messageBody.text = {
          body: JSON.stringify(cartTransformed),
        }
      }

      const messageResponse = await request.post(`${url}v1/messages/`, { headers, body: messageBody })
      if (messageResponse.status === 201) {
        messageToSend.messageWaId = messageResponse.data.messages[0].id
        messageToSend.sended = true
        await messageToSend.save()
        console.info(
          `Mensagem ${messageId} enviada para Dialog360 com sucesso! ${JSON.stringify(messageResponse.data)}`
        )
      } else {
        messageToSend.error = JSON.stringify(messageResponse.data)
        await messageToSend.save()
        console.error(`Mensagem ${messageId} não enviada para Dialog360. ${JSON.stringify(messageResponse.data)}`)
      }
    } else {
      console.error(
        `A mensagem não foi enviada para a Dialog pois o contato não é válido ${JSON.stringify(waContact.data)}`
      )
    }
  }

  async setWebhook(url, token) {
    const headers = { 'D360-API-KEY': token }

    const body = {
      url: `${this.licensee.urlWhatsappWebhook}`,
    }

    const response = await request.post(`${url}v1/configs/webhook`, { headers, body })

    return response.status === 200
  }

  async searchTemplates(url, token) {
    const dialogTemplates = await getTemplates(url, token)
    const templates = parseTemplates(dialogTemplates, this.licensee._id)

    return templates
  }
}

module.exports = Dialog
