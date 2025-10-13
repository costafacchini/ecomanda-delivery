import Trigger from '../../models/Trigger.js'
import Template from '../../models/Template.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import request from '../../services/request.js'
import { isPhoto, isVideo, isMidia, isVoice } from '../../helpers/Files.js'
import { parseText } from '../../helpers/ParseTriggerText.js'
import { MessengersBase } from './Base.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'

// const getWaIdContact = async (number, url, token) => {
//   const headers = {
//     'X-Api-Key': `${token}`,
//     accept: 'application/json',
//     'Content-Type': 'application/json',
//   }

//   const body = {
//     phoneNumber: `+${number}`,
//   }

//   try {
//     const response = await request.post(`${url}contact/contacts`, { headers, body })
//     return {
//       valid: response.status === 200,
//       waId: response.data.id,
//       data: response.data,
//     }
//   } catch (error) {
//     console.error('Erro ao verificar contato YCloud:', error)
//     return {
//       valid: false,
//       waId: null,
//       data: error.response?.data || error.message,
//     }
//   }
// }

const getTemplates = async (url, token) => {
  const headers = {
    'X-Api-Key': `${token}`,
    accept: 'application/json',
    'Content-Type': 'application/json',
  }

  try {
    const response = await request.get(`${url}/whatsapp/templates?page=1&limit=50&includeTotal=false`, { headers })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar templates YCloud:', error)
    return { templates: [] }
  }
}

const parseTemplates = (ycloudTemplates, licenseeId) => {
  const templates = []

  for (const template of ycloudTemplates.items || []) {
    const templateValues = {
      name: template.name,
      // namespace: template.namespace,
      licensee: licenseeId,
      language: template.language,
      active: template.status.toUpperCase() === 'APPROVED',
      category: template.category,
      officialTemplateId: template.officialTemplateId,
      wabaId: template.wabaId,
      headerParams: [],
      bodyParams: [],
      footerParams: [],
    }

    if (template.components) {
      template.components.forEach((component) => {
        const type = component.type.toLowerCase()

        if (component.format) {
          templateValues[`${type}Params`].push({ format: component.format })
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
    }

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
  if (param.format?.toUpperCase() === 'IMAGE') {
    return {
      type: 'image',
      image: {
        link: value.replace('{{', '').replace('}}', ''),
      },
    }
  }
  if (param.format?.toUpperCase() === 'TEXT' || param.format === 'text') {
    return {
      type: 'text',
      text: value.replace('{{', '').replace('}}', ''),
    }
  }
  return {
    type: 'text',
    text: value.replace('{{', '').replace('}}', ''),
  }
}

class YCloud extends MessengersBase {
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
    if (!responseBody.whatsappMessage) {
      this.messageStatus = null
      return
    }

    this.messageStatus = {
      id: responseBody.whatsappMessage.id,
      status: responseBody.whatsappMessage.status,
    }
  }

  parseMessage(responseBody) {
    if (!responseBody.whatsappInboundMessage) {
      this.messageData = null
      return
    }

    const message = responseBody.whatsappInboundMessage

    if (
      message.type === 'sticker' ||
      message.type === 'ephemeral' ||
      message.type === 'reaction' ||
      message.type === 'contacts' ||
      message.type === 'unsupported' ||
      message.type === 'system' ||
      message.type === 'interactive'
    ) {
      this.messageData = null
      return
    }

    this.messageData = {
      kind: message.type,
      waId: message.id,
    }

    switch (message.type) {
      case 'text':
        this.messageData.text = { body: message.text?.body || '' }
        break

      case 'button':
        this.messageData.kind = 'text'
        this.messageData.text = { body: message.button?.text || '' }
        break

      case 'order':
        this.messageData.order = {
          catalogId: message.order?.catalog_id,
          text: message.order?.text,
          productItems: message.order?.product_items || [],
        }
        break

      case 'image':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.image?.id,
          url: message.image?.link,
          fileName: message.image?.sha256,
          caption: message.image?.caption,
          fileBase64: null,
        }
        break

      case 'video':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.video?.id,
          url: message.video?.link,
          fileName: message.video?.sha256,
          caption: message.video?.caption,
          fileBase64: null,
        }
        break

      case 'voice':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.voice?.id,
          url: message.voice?.link,
          fileName: message.voice?.sha256,
          caption: message.voice?.caption,
          fileBase64: null,
        }
        break

      case 'audio':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.audio?.id,
          url: message.audio?.link,
          fileName: message.audio?.sha256,
          caption: message.audio?.caption,
          fileBase64: null,
        }
        break

      case 'document':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.document?.id,
          url: message.document?.link,
          fileName: message.document?.filename,
          caption: message.document?.caption,
          fileBase64: null,
        }
        break

      case 'location':
        this.messageData.kind = 'location'
        this.messageData.latitude = message.location?.latitude
        this.messageData.longitude = message.location?.longitude
        this.messageData.name = message.location?.name
        this.messageData.address = message.location?.address
        break

      default:
        this.messageData = null
    }
  }

  parseContactData(responseBody) {
    if (!responseBody.whatsappInboundMessage) {
      this.contactData = null
      return
    }

    const chatId = responseBody.whatsappInboundMessage.from
    const contact = responseBody.whatsappInboundMessage.customerProfile
    const normalizePhone = new NormalizePhone(chatId)

    this.contactData = {
      number: normalizePhone.number,
      type: normalizePhone.type,
      name: contact?.name || '',
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

    const headers = {
      'X-Api-Key': `${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    }

    const messageBody = {
      from: `+${this.licensee.phone}`,
      to: `+${messageToSend.contact.number}`,
      type: 'individual',
    }

    switch (messageToSend.kind) {
      case 'text':
        messageBody.type = 'text'
        messageBody.text = {
          body: messageToSend.text,
        }
        break

      case 'template': {
        const parameters = messageToSend.text.match(/\{\{[^}]+\}\}/g) || []
        const templateName = parameters[0]?.replace('{{', '').replace('}}', '') || ''

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

        break
      }
      case 'interactive': {
        const trigger = await Trigger.findById(messageToSend.trigger)
        if (trigger) {
          messageBody.type = 'interactive'

          switch (trigger.triggerKind) {
            case 'multi_product':
              messageBody.interactive = JSON.parse(trigger.catalogMulti)
              break
            case 'single_product':
              messageBody.interactive = JSON.parse(trigger.catalogSingle)
              break
            case 'reply_button':
              messageBody.interactive = JSON.parse(trigger.textReplyButton)
              break
            case 'list_message':
              messageBody.interactive = JSON.parse(trigger.messagesList)
              break
            case 'text':
              messageBody.type = 'text'
              messageBody.text = {
                body: await parseText(trigger.text, messageToSend.contact),
              }
              break
            default:
              messageBody.type = 'text'
              messageBody.text = { body: messageToSend.text }
          }
        } else {
          messageBody.type = 'text'
          messageBody.text = { body: messageToSend.text }
        }
        break
      }
      case 'file':
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
        break

      case 'location':
        messageBody.type = 'location'
        messageBody.location = {
          longitude: messageToSend.longitude,
          latitude: messageToSend.latitude,
        }
        break

      default:
        messageBody.type = 'text'
        messageBody.text = { body: messageToSend.text || 'Mensagem não suportada' }
    }

    try {
      const messageResponse = await request.post(`${url}/whatsapp/messages/sendDirectly`, {
        headers,
        body: messageBody,
      })

      if (messageResponse.status === 200 || messageResponse.status === 201) {
        messageToSend.messageWaId = messageResponse.data?.id
        messageToSend.sended = true
        await messageToSend.save()
        console.info(`Mensagem ${messageId} enviada para YCloud com sucesso! ${JSON.stringify(messageResponse.data)}`)
      } else {
        messageToSend.error = JSON.stringify(messageResponse.data)
        await messageToSend.save()
        console.error(`Mensagem ${messageId} não enviada para YCloud. ${JSON.stringify(messageResponse.data)}`)
      }
    } catch (error) {
      messageToSend.error = JSON.stringify(error.response?.data || error.message)
      await messageToSend.save()
      console.error(`Erro ao enviar mensagem ${messageId} para YCloud:`, error)
    }
  }

  async setWebhook(url, token) {
    const headers = {
      'X-Api-Key': `${token}`,
      accept: 'application/json',
      'Content-Type': 'application/json',
    }

    const body = {
      url: `${this.licensee.urlWhatsappWebhook}`,
      events: ['whatsapp.inbound_message.received'],
    }

    try {
      const response = await request.post(`${url}/webhookEndpoints`, { headers, body })
      return response.status === 200 || response.status === 201
    } catch (error) {
      console.error('Erro ao configurar webhook YCloud:', error)
      return false
    }
  }

  async searchTemplates(url, token) {
    try {
      const ycloudTemplates = await getTemplates(url, token)
      const templates = parseTemplates(ycloudTemplates, this.licensee._id)
      return templates
    } catch (error) {
      console.error('Erro ao buscar templates YCloud:', error)
      return []
    }
  }
}

export { YCloud }
