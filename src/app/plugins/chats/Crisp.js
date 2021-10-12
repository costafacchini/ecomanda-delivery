const emoji = require('../../helpers/Emoji')
const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const Room = require('@models/Room')
const request = require('../../services/request')

class Crisp {
  constructor(licensee) {
    this.licensee = licensee
  }

  action(responseBody) {
    if (responseBody.type === 'LivechatSession') {
      return 'close-chat'
    } else {
      if (responseBody && responseBody.messages && responseBody.messages.find((message) => message.closingMessage)) {
        return 'close-chat'
      } else {
        return 'send-message-to-messenger'
      }
    }
  }

  async responseToMessages(responseBody) {
    if (!responseBody._id) return []

    const room = await Room.findOne({ roomId: responseBody._id }).populate('contact')
    if (!room) return []

    const contact = await Contact.findOne({ _id: room.contact._id })

    const processedMessages = []

    if (this.action(responseBody) === 'close-chat') {
      const messageToSend = new Message({
        number: uuidv4(),
        text: 'Chat encerrado pelo agente',
        kind: 'text',
        licensee: this.licensee._id,
        contact: contact._id,
        room: room._id,
        destination: 'to-messenger',
      })

      processedMessages.push(await messageToSend.save())
    } else {
      for (const message of responseBody.messages) {
        let text = message.attachments ? message.attachments[0].description : message.msg
        text = text ? emoji.replace(text) : ''

        const messageToSend = new Message({
          number: uuidv4(),
          text,
          kind: 'text',
          licensee: this.licensee._id,
          contact: contact._id,
          room: room._id,
          destination: 'to-messenger',
        })

        if (message.attachments) {
          messageToSend.kind = 'file'
          messageToSend.url = message.fileUpload.publicFilePath
          messageToSend.fileName = message.attachments[0].title
        }

        processedMessages.push(await messageToSend.save())
      }
    }

    return processedMessages
  }

  async transfer(messageId, url) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    const contact = await Contact.findById(messageToSend.contact._id)

    contact.talkingWithChatBot = false
    await contact.save()

    await this.sendMessage(messageId, url)
  }

  async sendMessage(messageId, url) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    const openRoom = await Room.findOne({ contact: messageToSend.contact, closed: false })
    let room = openRoom

    if (!room) {
      const token = messageToSend.contact._id.toString()
      if (await this.#createVisitor(messageToSend.contact, token, url) === true) {
        room = await this.#createRoom(messageToSend.contact, token, url)
        if (!room) {
          return
        }
      } else {
        return
      }
    }

    if (messageToSend.departament && messageToSend.departament !== '') {
      await this.#transferToDepartament(messageToSend.departament, room, url)
    }

    await this.#postMessage(messageToSend.contact, messageToSend, room, url)
  }

  async #createVisitor(contact, token, url) {
    const body = {
      visitor: {
        name: `${contact.name} - ${contact.number} - WhatsApp`,
        email: contact.email ? `${contact.email}` : `${contact.number}${contact.type}`,
        token: `${token}`
      }
    }

    const response = await request.post(`${url}/api/v1/livechat/visitor`, { body })

    if (response.data.success !== true) {
      console.error(`Não foi possível criar o visitante na Rocketchat ${JSON.stringify(response.data)}`)
    }

    return response.data.success === true
  }

  async #createRoom(contact, token, url) {
    const response = await request.get(`${url}/api/v1/livechat/room?token=${token}`)

    if (response.data.success !== true) {
      console.error(`Não foi possível criar a sala na Rocketchat ${JSON.stringify(response.data)}`)
      return
    }

    const room = await Room.create({
      roomId: response.data.room._id,
      contact: contact._id,
      token: token
    })

    return room
  }

  async #transferToDepartament(department, room, url) {
    const body = {
      token: `${room.token}`,
      rid: room.roomId,
      department
    }

    await request.post(`${url}/api/v1/livechat/room.transfer`, { body })
  }

  async #postMessage(contact, message, room, url) {
    const body = {
      token: `${room.token}`,
      rid: room.roomId,
      msg: this.#formatMessage(message, contact)
    }

    const response = await request.post(`${url}/api/v1/livechat/message`, { body })

    if (!message.room || message.room._id !== room._id) message.room = room

    if (response.data.success === true) {
      message.sended = true
      await message.save()

      console.info(`Mensagem ${message._id} enviada para Rocketchat com sucesso!`)
    } else {
      message.error = message.error ? `${message.error} | ${JSON.stringify(response.data)}` : JSON.stringify(response.data)
      if (message.error.includes('room-closed')) {
        room.closed = true
        await room.save()
        message.room = null
      }
      await message.save()

      if (message.error.includes('room-closed')) {
        await this.sendMessage(message._id, url)
      } else {
        console.error(`Mensagem ${message._id} não enviada para a Rocketchat ${JSON.stringify(response.data)}`)
      }
    }

    return response.data.success === true
  }

  #formatMessage(message, contact) {
    let text = message.text
    if (message.kind === 'file') {
      text = message.url
    }

    return contact.type === '@c.us' ? text : `*${message.senderName}:*\n${text}`
  }

  async closeChat(messageId) {
    const message = await Message.findById(messageId).populate('contact').populate('licensee').populate('room')
    const licensee = message.licensee
    const contact = await Contact.findById(message.contact._id)
    const room = await Room.findById(message.room._id)

    room.closed = true
    await room.save()

    if (licensee.useChatbot) {
      contact.talkingWithChatBot = true
      await contact.save()
    }
  }
}

module.exports = Crisp

// Quando abrir uma nova conversa é preciso pegar um novo SessionId
// message:send - Mensagem enviada de um visitante (recebida por operadores)
// {
//   "website_id": "e93e073a-1f69-4cbc-8934-f9e1611e65bb",
//     "event": "message:send",

//       "data": {
//     "type": "text",
//       "origin": "chat",
//         "content": "Hello Crisp, this is a message from a visitor!",
//           "timestamp": 1632396148646,
//             "fingerprint": 163239614854320,
//               "website_id": "e93e073a-1f69-4cbc-8934-f9e1611e65bb",
//                 "session_id": "session_94e30081-c1ff-4656-b612-9c6e18d70ffb",
//                   "from": "user",

//                     "user": {
//       "nickname": "visitor607",
//         "user_id": "session_94e30081-c1ff-4656-b612-9c6e18d70ffb"
//     },

//     "stamped": true
//   },

//   "timestamp": 1632396148743
// }

// message:received - Mensagem enviada de um operador (recebida por visitantes)
// {
//   "website_id": "e93e073a-1f69-4cbc-8934-f9e1611e65bb",
//     "event": "message:received",

//       "data": {
//     "website_id": "e93e073a-1f69-4cbc-8934-f9e1611e65bb",
//       "type": "text",
//         "from": "operator",
//           "origin": "chat",
//             "content": "Hello! This is a message from the Operator!",
//               "fingerprint": 163239623329114,

//                 "user": {
//       "nickname": "Dinis Tavares",
//         "user_id": "440ac64d-fee9-4935-b7a8-4c8cb44bb13c"
//     },

//     "mentions": [],
//       "timestamp": 1632396233539,
//         "stamped": true,
//           "session_id": "session_94e30081-c1ff-4656-b612-9c6e18d70ffb"
//   },

//   "timestamp": 1632396233588
// }

// session:removed - quando a conversa é excluida (precisamos limpar a session_id)
// {
//   "website_id": "e93e073a-1f69-4cbc-8934-f9e1611e65bb",
//     "event": "session:removed",

//       "data": {
//     "session_id": "session_ab097597-c3a1-4274-926c-f0dee322cecf",
//       "website_id": "e93e073a-1f69-4cbc-8934-f9e1611e65bb"
//   },

//   "timestamp": 1632409808497
// }

// Atributos do sendMessage()
// {
//   type: text | note | file | audio |
//   from: user (vamos usar esse) | operator |
//   origin: chat (vamos usar esse) | email |
//   content: string se for text ou note | objeto se for do tipo file, audio -> objeto: { name: string, url: string, type: string (MIME TYPE) }
//   user: { nickname: string }
// }

// Para gerar a autenticação devemos fazer um base64 da key e do identifier
// BASE64(licensee.chatIdentifier: licensee.chatKey)

// Abrir uma nova conversa
// curl--request POST \
// --url https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation \
// --header 'Authorization: Basic YTE1N2RhOTMtNDJiNi00MjBhLWExZDYtNzQwNjMxMTI0MDIzOmU3ZGQwNDlhMDg1OGMzNjMyYWMwYjE5Nzg4M2ExODU2NzhhNmVjOGY0ZTQyOWYwNTllMThkZDg4YWFkYTM3M2Q=' \
// --header 'Content-Type: application/json'

// Atualizar a conversa para batizar o usuário
// curl--request PATCH \
// --url https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/meta \
// --header 'Authorization: Basic YTE1N2RhOTMtNDJiNi00MjBhLWExZDYtNzQwNjMxMTI0MDIzOmU3ZGQwNDlhMDg1OGMzNjMyYWMwYjE5Nzg4M2ExODU2NzhhNmVjOGY0ZTQyOWYwNTllMThkZDg4YWFkYTM3M2Q=' \
// --header 'Content-Type: application/json' \
// --data '{
// "nickname": "Tester",
//   "email": "55668346827346@test.com",
//     "phone": "55668346827346"
// }'

// Enviar mensagem de texto
// curl--request POST \
// --url https://api.crisp.chat/v1/website/631d631e-2047-453e-9989-93edda91b945/conversation/session_a06054de-d9dc-407a-98ea-72c7fb460472/message \
// --header 'Authorization: Basic YTE1N2RhOTMtNDJiNi00MjBhLWExZDYtNzQwNjMxMTI0MDIzOmU3ZGQwNDlhMDg1OGMzNjMyYWMwYjE5Nzg4M2ExODU2NzhhNmVjOGY0ZTQyOWYwNTllMThkZDg4YWFkYTM3M2Q=' \
// --header 'Content-Type: application/json' \
// --data '{
// "type": "text",
//   "from": "user",
//     "origin": "chat",
//       "content": "Test"
// }'