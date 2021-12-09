const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Trigger = require('@models/Trigger')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const S3 = require('../storage/S3')
const request = require('../../services/request')
const files = require('../../helpers/Files')
const mime = require('mime-types')

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

class Dialog {
  constructor(licensee) {
    this.licensee = licensee
  }

  action(messageDestination) {
    if (messageDestination === 'to-chat') {
      return 'send-message-to-chat'
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

    const messageToSend = new Message({
      number: uuidv4(),
      messageWaId: responseBody.messages[0].id,
      licensee: this.licensee._id,
      contact: contact._id,
      destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
    })

    if (responseBody.messages[0].type === 'text') {
      messageToSend.kind = 'text'
      messageToSend.text = responseBody.messages[0].text.body
    } else if (responseBody.messages[0].type === 'interactive') {
      const expression = responseBody.messages[0].interactive.list_reply
        ? responseBody.messages[0].interactive.list_reply.id
        : responseBody.messages[0].interactive.button_reply.id

      const trigger = await Trigger.findOne({ expression, licensee: this.licensee._id })
      if (trigger) {
        messageToSend.kind = 'interactive'
        messageToSend.destination = 'to-messenger'
        messageToSend.trigger = trigger._id
      } else {
        messageToSend.text = expression
      }
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

    return [await messageToSend.save()]
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
}

module.exports = Dialog
