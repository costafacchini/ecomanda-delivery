import Trigger from '../../models/Trigger.js'
import Template from '../../models/Template.js'
import { NormalizePhone } from '../../helpers/NormalizePhone.js'
import request from '../../services/request.js'
import { isPhoto, isVideo, isMidia, isVoice } from '../../helpers/Files.js'
import { parseText } from '../../helpers/ParseTriggerText.js'
import { MessengersBase } from './Base.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'

const getTemplates = async (url, token) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  try {
    const response = await request.get(`${url}/templates?limit=20&page=1`, { headers })
    return response.data.templates
  } catch (error) {
    console.error('Pabbly - erro: Erro ao buscar templates Pabbly:', error)
    return { templates: [] }
  }
}

const parseTemplates = (pabblyTemplates, licenseeId) => {
  const templates = []

  for (const template of pabblyTemplates || []) {
    const templateValues = {
      name: template.name,
      // namespace: template.namespace,
      licensee: licenseeId,
      language: template.language,
      active: template.status.toUpperCase() === 'APPROVED',
      category: template.category,
      officialTemplateId: template.waTemplateId,
      wabaId: template.waTemplateId,
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

class Pabbly extends MessengersBase {
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

  parseMessageStatus(_) {
    this.messageStatus = null
  }

  parseMessage(responseBody) {
    if (!responseBody.data || !['smb_message_echoes', 'message_received'].includes(responseBody.data.name)) {
      this.messageData = null
      return
    }

    const message = responseBody.data.event_data

    if (
      message.type === 'sticker' ||
      message.type === 'ephemeral' ||
      message.type === 'reaction' ||
      message.type === 'contacts' ||
      message.type === 'unsupported' ||
      message.type === 'system' ||
      message.type === 'button' ||
      message.type === 'order' ||
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

      case 'image':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.image?.id,
          fileName: message.image?.sha256,
          caption: message.image?.caption,
          fileBase64: null,
        }
        break

      case 'video':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.video?.id,
          fileName: message.video?.sha256,
          caption: message.video?.caption,
          fileBase64: null,
        }
        break

      case 'voice':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.voice?.id,
          fileName: message.voice?.sha256,
          caption: message.voice?.caption,
          fileBase64: null,
        }
        break

      case 'audio':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.audio?.id,
          fileName: message.audio?.sha256,
          caption: message.audio?.caption,
          fileBase64: null,
        }
        break

      case 'document':
        this.messageData.kind = 'file'
        this.messageData.file = {
          id: message.document?.id,
          fileName: message.document?.filename,
          caption: message.document?.caption,
          fileBase64: null,
        }
        break

      case 'location':
        this.messageData.kind = 'location'
        this.messageData.latitude = message.location?.latitude
        this.messageData.longitude = message.location?.longitude
        break

      default:
        this.messageData = null
    }
  }

  parseContactData(responseBody) {
    if (!responseBody.data || !['message_received', 'contact_created'].includes(responseBody.data.name)) {
      this.contactData = null
      return
    }

    const chatId = responseBody.data.event_data.from || responseBody.data.event_data.mobile
    // const contact = responseBody.whatsappInboundMessage.customerProfile
    const normalizePhone = new NormalizePhone(chatId)

    this.contactData = {
      number: normalizePhone.number,
      type: normalizePhone.type,
      name: responseBody.data.event_data.name || normalizePhone.number,
      wa_start_chat: new Date(),
    }
  }

  contactWithDifferentData(_) {
    return false
  }

  shouldUpdateWaStartChat(contact) {
    return !contact.wa_start_chat
  }

  async sendMessage(messageId, url, token) {
    const messageRepository = new MessageRepositoryDatabase()
    const messageToSend = await messageRepository.findFirst({ _id: messageId }, ['contact'])

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    const messageBody = {
      to: `+${messageToSend.contact.number}`,
      type: 'individual',
    }

    switch (messageToSend.kind) {
      case 'text':
        messageBody.type = 'text'
        messageBody.message = messageToSend.senderName
          ? `*${messageToSend.senderName}:*\n${messageToSend.text}`
          : messageToSend.text
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
              messageBody.text = {
                body: messageToSend.senderName
                  ? `${messageToSend.senderName}: ${messageToSend.text}`
                  : messageToSend.text,
              }
          }
        } else {
          messageBody.type = 'text'
          messageBody.text = {
            body: messageToSend.senderName ? `${messageToSend.senderName}: ${messageToSend.text}` : messageToSend.text,
          }
        }
        break
      }
      case 'file': {
        messageBody.link = messageToSend.url

        if (isPhoto(messageToSend.url)) {
          messageBody.type = 'image'
        } else if (isVideo(messageToSend.url)) {
          messageBody.type = 'video'
        } else if (isMidia(messageToSend.url) || isVoice(messageToSend.url)) {
          messageBody.type = 'audio'
        } else {
          messageBody.type = 'document'
          messageBody.filename = messageToSend.fileName
        }
        break
      }
      case 'location':
        messageBody.type = 'text'
        messageBody.message = `longitude: ${messageToSend.longitude}, latitude: ${messageToSend.latitude}`
        break

      default:
        messageBody.type = 'text'
        messageBody.message = messageToSend.senderName
          ? `${messageToSend.senderName}: ${messageToSend.text}`
          : messageToSend.text || 'Mensagem não suportada pela Pabbly'
    }

    try {
      const messageResponse = await request.post(`${url}/messages`, {
        headers,
        body: messageBody,
      })

      console.info(`Pabbly: body PENDENTE ${JSON.stringify(messageResponse)}`)
      if (messageResponse.status === 200 || messageResponse.status === 201) {
        messageToSend.messageWaId = messageResponse.data?.messages[0]?.id
        messageToSend.sended = true
        await messageToSend.save()
        console.info(
          `Pabbly: Mensagem ${messageId} enviada para Pabbly com sucesso! ${JSON.stringify(messageResponse.data)}`,
        )
      } else {
        messageToSend.error = JSON.stringify(messageResponse.data)
        await messageToSend.save()
        console.error(
          `Pabbly - erro: Mensagem ${messageId} não enviada para Pabbly. ${JSON.stringify(messageResponse.data)}`,
        )
      }
    } catch (error) {
      messageToSend.error = JSON.stringify(error.response?.data || error.message)
      await messageToSend.save()
      console.error(`Pabbly - erro: Erro ao enviar mensagem ${messageId} para Pabbly:`, error)
    }
  }

  async searchTemplates(url, token) {
    try {
      const pabblyTemplates = await getTemplates(url, token)
      const templates = parseTemplates(pabblyTemplates, this.licensee._id)
      return templates
    } catch (error) {
      console.error('Pabbly - erro: Erro ao buscar templates Pabbly:', error)
      return []
    }
  }

  async getMediaUrl(mediaId, url, token, _contact) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    try {
      const response = await request.get(`${url}/media?id=${mediaId}`, { headers })
      console.info(`Pabbly: getMediaUrl status: ${response.status} payload: ${JSON.stringify(response.data)}`)
      if (response.status === 200 && response.data.status === 'success') return response.data.data.mediaUrl
    } catch (error) {
      console.error('Pabbly - erro: Erro ao buscar midia na Pabbly:', error)
    }
  }
}

export { Pabbly }
