const Message = require('@models/Message')
const Contact = require('@models/Contact')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const S3 = require('../storage/S3')
const request = require('../../services/request')
const files = require('../../helpers/Files')

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
    // Evento de status de mensagem: Leitura
    // {
    //   "body": {
    //     "statuses": [
    //       {
    //         "id": "gBEGVUiZKQggAgk2thNSRVRecPk",
    //         "recipient_id": "554899290820",
    //         "status": "read",
    //         "timestamp": "1632478856"
    //       }
    //     ]
    //   }
    // }

    // Evento de status de mensagem: Enviada
    // {
    //   "body": {
    //     "statuses": [
    //       {
    //         "conversation": {
    //           "id": "42791d1cc46916c652fdc5b7816ce187"
    //         },
    //         "id": "gBEGVUiZKQggAgmPv4pP_OixTyo",
    //         "pricing": {
    //           "billable": false,
    //           "pricing_model": "NBP"
    //         },
    //         "recipient_id": "554899290820",
    //         "status": "sent",
    //         "timestamp": "1632479972"
    //       }
    //     ]
    //   }
    // }

    // Evento de status de mensagem: Entregue
    // {
    //   "body": {
    //     "statuses": [
    //       {
    //         "conversation": {
    //           "id": "42791d1cc46916c652fdc5b7816ce187"
    //         },
    //         "id": "gBEGVUiZKQggAgmPv4pP_OixTyo",
    //         "pricing": {
    //           "billable": false,
    //           "pricing_model": "NBP"
    //         },
    //         "recipient_id": "554899290820",
    //         "status": "delivered",
    //         "timestamp": "1632479975"
    //       }
    //     ]
    //   }
    // }

    // Evento de mensagem de áudio recebida
    // {
    //   "body": {
    //     "contacts": [
    //       {
    //         "profile": {
    //           "name": "Alan Facchini"
    //         },
    //         "wa_id": "554899290820"
    //       }
    //     ],
    //       "messages": [
    //         {
    //           "from": "554899290820",
    //           "id": "ABEGVUiZKQggAhBMIPBwKdGLK41Trqk9jxUU",
    //           "timestamp": "1632480156",
    //           "type": "voice",
    //           "voice": {
    //             "id": "930f6128-05d8-4572-bba3-c1e97b21b29d",
    //             "mime_type": "audio/ogg; codecs=opus",
    //             "sha256": "e8e8ffda16122145c8922bd7037dcdf9a168e807d974b696d64b5341db66cb79"
    //           }
    //         }
    //       ]
    //   }
    // }

    // Evento de mensagem de texto recebida
    // {
    //   "body": {
    //     "contacts": [
    //       {
    //         "profile": {
    //           "name": "Alan Facchini"
    //         },
    //         "wa_id": "554899290820"
    //       }
    //     ],
    //       "messages": [
    //         {
    //           "from": "554899290820",
    //           "id": "ABEGVUiZKQggAhCti8dys1iwI7xxiFI5BwIu",
    //           "text": {
    //             "body": "Clave teste"
    //           },
    //           "timestamp": "1632481790",
    //           "type": "text"
    //         }
    //       ]
    //   }
    // }

    const chatId = responseBody.body.messages[0].from
    const normalizePhone = new NormalizePhone(chatId)
    let contact = await Contact.findOne({
      number: normalizePhone.number,
      type: normalizePhone.type,
      licensee: this.licensee._id,
    })

    if (!contact) {
      contact = new Contact({
        name: bodyParsed.name,
        number: normalizePhone.number,
        type: normalizePhone.type,
        talkingWithChatBot: this.licensee.useChatbot,
        waId: responseBody.body.contacts[0].wa_id,
        licensee: this.licensee._id,
      })
      await contact.save()
    } else {
      if (contact.name !== responseBody.body.contacts[0].profile.name || contact.waId !== responseBody.body.contacts[0].wa_id) {
        contact.name = bodyParsed.name
        contact.waId = responseBody.body.contacts[0].wa_id
        contact.talkingWithChatBot = this.licensee.useChatbot
        await contact.save()
      }
    }

    const messageToSend = new Message({
      number: uuidv4(),
      messageWaId: responseBody.body.messages[0].id,
      licensee: this.licensee._id,
      contact: contact._id,
      destination: contact.talkingWithChatBot ? 'to-chatbot' : 'to-chat',
    })


    if (responseBody.body.messages[0].type === 'text') {
      messageToSend.kind = 'text'
      messageToSend.text = responseBody.body.messages[0].text.body
    } else if (responseBody.body.messages[0].type === 'image') {
      messageToSend.kind = 'file'
      messageToSend.attachmentWaId = responseBody.body.messages[0].image.id

      // messageToSend.url =
      messageToSend.fileName = responseBody.body.messages[0].image.sha256
    } else if (responseBody.body.messages[0].type === 'video') {
      messageToSend.kind = 'file'
      messageToSend.attachmentWaId = responseBody.body.messages[0].video.id

      // messageToSend.url =
      messageToSend.fileName = responseBody.body.messages[0].video.sha256
    } else if (responseBody.body.messages[0].type === 'voice') {
      messageToSend.kind = 'file'
      messageToSend.attachmentWaId = responseBody.body.messages[0].voice.id

      // messageToSend.url =
      messageToSend.fileName = responseBody.body.messages[0].voice.sha256
    } else if (responseBody.body.messages[0].type === 'audio') {
      messageToSend.kind = 'file'
      messageToSend.attachmentWaId = responseBody.body.messages[0].audio.id

      // messageToSend.url =
      messageToSend.fileName = responseBody.body.messages[0].audio.sha256
    } else if (responseBody.body.messages[0].type === 'document') {
      messageToSend.kind = 'file'
      messageToSend.attachmentWaId = responseBody.body.messages[0].document.id

      // messageToSend.url =
      messageToSend.fileName = responseBody.body.messages[0].document.filename
    }



    if (bodyParsed.sender) messageToSend.senderName = bodyParsed.sender
    if (messageToSend.kind === 'file') {
      messageToSend.fileName = bodyParsed.fileName
      messageToSend.url = this.#uploadFile(contact, messageToSend.fileName, bodyParsed.blob)
    }
    return [await messageToSend.save()]

    // if (!responseBody.event) return []
    // const bodyParsed = this.#parseBody(responseBody)
    // if (bodyParsed.dir === 'o') {
    //   return []
    // }

  }

  async sendMessage(messageId, url, token) {
    const messageToSend = await Message.findById(messageId).populate('contact')

    const waContact = await this.#getContact(messageToSend.contact.number, url, token)
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
        console.info(`Mensagem ${messageId} enviada para Dialog360 com sucesso! ${JSON.stringify(messageResponse.data)}`)
      } else {
        messageToSend.error = JSON.stringify(messageResponse.data)
        await messageToSend.save()
        console.error(`Mensagem ${messageId} não enviada para Dialog360. ${JSON.stringify(messageResponse.data)}`)
      }
    } else {
      console.error(`A mensagem não foi enviada para a Dialog pois o contato não é válido ${JSON.stringify(waContact.data)}`)
    }
  }

  async #getContact(number, url, token) {
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
}

module.exports = Dialog
