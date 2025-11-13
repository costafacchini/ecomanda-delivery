import Trigger from '../../models/Trigger.js'
import Template from '../../models/Template.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import request from '../../services/request.js'
import { isPhoto, isVideo, isMidia, isVoice } from '../../helpers/Files.js'
import { createCartPlugin } from '../../plugins/carts/factory.js'
import { parseText } from '../../helpers/ParseTriggerText.js'
import { MessengersBase } from './Base.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'
import { S3 } from '../storage/S3.js'
import mime from 'mime-types'

const getWaIdContact = async (number, url, token) => {
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

const parseComponents = (template, parameters) => {
  const components = []
  let paramCounter = 1

  if (template.headerParams.length > 0) {
    const header = []
    template.headerParams.forEach((param, index) => {
      header.push(parseComponentParam(param, parameters[index + paramCounter]))
    })
    components.push({
      type: 'header',
      parameters: header,
    })
    paramCounter += template.headerParams.length
  }

  if (template.bodyParams.length > 0) {
    const body = []
    template.bodyParams.forEach((param, index) => {
      body.push(parseComponentParam(param, parameters[index + paramCounter]))
    })
    components.push({
      type: 'body',
      parameters: body,
    })
    paramCounter += template.bodyParams.length
  }

  if (template.footerParams.length > 0) {
    const footer = []
    template.footerParams.forEach((param, index) => {
      footer.push(parseComponentParam(param, parameters[index + paramCounter]))
    })
    components.push({
      type: 'footer',
      parameters: footer,
    })
  }

  return components
}

const parseComponentParam = (param, value) => {
  if (param.format.toUpperCase() === 'IMAGE') {
    return {
      type: 'image',
      image: {
        link: value.replace('{{', '').replace('}}', ''),
      },
    }
  }
  if (param.format.toUpperCase() === 'TEXT') {
    return {
      type: 'text',
      text: value.replace('{{', '').replace('}}', ''),
    }
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

class Dialog extends MessengersBase {
  constructor(licensee) {
    super(licensee)
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

  parseMessageStatus(responseBody) {
    this.messageStatus = responseBody.statuses ? responseBody.statuses[0] : null
  }

  parseMessage(responseBody) {
    if (
      !responseBody.messages ||
      responseBody.messages[0].type === 'sticker' ||
      responseBody.messages[0].type === 'ephemeral'
    ) {
      this.messageData = null
      return
    }

    this.messageData = {
      kind: responseBody.messages[0].type,
      waId: responseBody.messages[0].id,
    }

    if (this.messageData.kind === 'interactive') {
      const expression = responseBody.messages[0].interactive.list_reply
        ? responseBody.messages[0].interactive.list_reply.id
        : responseBody.messages[0].interactive.button_reply.id

      this.messageData.interactive = { expression }
    } else if (this.messageData.kind === 'text') {
      this.messageData.text = { body: responseBody.messages[0].text.body }
    } else if (this.messageData.kind === 'button') {
      this.messageData.kind = 'text'
      this.messageData.text = { body: responseBody.messages[0].button.text }
    } else if (responseBody.messages[0].type === 'order') {
      this.messageData.order = {
        catalogId: responseBody.messages[0].order.catalog_id,
        text: responseBody.messages[0].order.text,
        productItems: responseBody.messages[0].order.product_items,
      }
    } else if (responseBody.messages[0].type === 'image') {
      this.messageData.kind = 'file'
      this.messageData.file = {
        id: responseBody.messages[0].image.id,
        fileName: responseBody.messages[0].image.sha256,
        fileBase64: null,
      }
    } else if (responseBody.messages[0].type === 'video') {
      this.messageData.kind = 'file'
      this.messageData.file = {
        id: responseBody.messages[0].video.id,
        fileName: responseBody.messages[0].video.sha256,
        fileBase64: null,
      }
    } else if (responseBody.messages[0].type === 'voice') {
      this.messageData.kind = 'file'
      this.messageData.file = {
        id: responseBody.messages[0].voice.id,
        fileName: responseBody.messages[0].voice.sha256,
        fileBase64: null,
      }
    } else if (responseBody.messages[0].type === 'audio') {
      this.messageData.kind = 'file'
      this.messageData.file = {
        id: responseBody.messages[0].audio.id,
        fileName: responseBody.messages[0].audio.sha256,
        fileBase64: null,
      }
    } else if (responseBody.messages[0].type === 'document') {
      this.messageData.kind = 'file'
      this.messageData.file = {
        id: responseBody.messages[0].document.id,
        fileName: responseBody.messages[0].document.filename,
        fileBase64: null,
      }
    }
  }

  parseContactData(responseBody) {
    if (
      !responseBody.messages ||
      responseBody.messages[0].type === 'sticker' ||
      responseBody.messages[0].type === 'ephemeral'
    ) {
      this.contactData = null
      return
    }

    const chatId = responseBody.messages[0].from
    const normalizePhone = new NormalizePhone(chatId)
    this.contactData = {
      number: normalizePhone.number,
      type: normalizePhone.type,
      waId: responseBody.contacts[0].wa_id,
      name: responseBody.contacts[0].profile.name,
      wa_start_chat: new Date(),
    }
  }

  contactWithDifferentData(contact) {
    return (
      (this.contactData.name && this.contactData.name !== contact.name) ||
      (this.contactData.waId && this.contactData.waId !== contact.waId)
    )
  }

  shouldUpdateWaStartChat(contact) {
    return !contact.wa_start_chat
  }

  async sendMessage(messageId, url, token) {
    const messageRepository = new MessageRepositoryDatabase()
    const messageToSend = await messageRepository.findFirst({ _id: messageId }, ['contact'])

    let waId = messageToSend.contact.waId
    if (!waId) {
      const waContact = await getWaIdContact(messageToSend.contact.number, url, token)
      if (waContact.valid) {
        waId = waContact.waId
      } else {
        console.error(
          `A mensagem não foi enviada para a Dialog pois o contato não é válido ${JSON.stringify(waContact.data)}`,
        )
        return
      }
    }

    const headers = { 'D360-API-KEY': token }

    const messageBody = {
      recipient_type: 'individual',
      to: waId,
    }

    if (messageToSend.kind === 'text') {
      messageBody.type = 'text'
      messageBody.text = {
        body: messageToSend.text,
      }
    }

    if (messageToSend.kind === 'template') {
      const parameters = messageToSend.text.match(/\{\{[^}]+\}\}/g)
      const templateName = parameters[0].replace('{{', '').replace('}}', '')

      const template = await Template.findOne({ name: templateName })

      messageBody.type = 'template'
      messageBody.template = {
        namespace: template.namespace,
        name: template.name,
        language: {
          code: template.language,
          policy: 'deterministic',
        },
        components: [],
      }

      messageBody.template.components = parseComponents(template, parameters)
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
      if (isPhoto(messageToSend.url)) {
        messageBody.type = 'image'
        messageBody.image = {
          link: messageToSend.url,
        }
      } else if (isVideo(messageToSend.url)) {
        messageBody.type = 'video'
        messageBody.video = {
          link: messageToSend.url,
        }
      } else if (isMidia(messageToSend.url) || isVoice(messageToSend.url)) {
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
      const cartPlugin = createCartPlugin(this.licensee)
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
      console.info(`Mensagem ${messageId} enviada para Dialog360 com sucesso! ${JSON.stringify(messageResponse.data)}`)
    } else {
      messageToSend.error = JSON.stringify(messageResponse.data)
      await messageToSend.save()
      console.error(`Mensagem ${messageId} não enviada para Dialog360. ${JSON.stringify(messageResponse.data)}`)
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

  async getMediaUrl(mediaId, _url, token, contact) {
    const response = await downloadMedia(mediaId, token)
    const extension = mime.extension(response.headers.get('content-type'))
    const fileName = `${mediaId}.${extension}`
    const fileBase64 = Buffer.from(response.data).toString('base64')

    return uploadFile(this.licensee, contact, fileName, fileBase64)
  }
}

export { Dialog }
