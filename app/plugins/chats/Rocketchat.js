const emoji = require('../../helpers/Emoji')
const NormalizePhone = require('../../helpers/NormalizePhone')
const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const Contact = require('@models/Contact')
const request = require('../../services/request')

class Rocketchat {
  constructor(licensee) {
    this.licensee = licensee
  }

  action(responseBody) {
    if (responseBody.type === 'LivechatSession') {
      return 'close-chat'
    } else {
      return 'send-message-to-messenger'
    }
  }

  async responseToMessages(responseBody) {
    if (!responseBody._id) return []

    const contact = await Contact.findOne({
      roomId: responseBody._id,
      licensee: this.licensee,
    })

    const processedMessages = []

    if (this.action(responseBody) === 'close-chat') {
      const messageToSend = new Message({
        number: uuidv4(),
        text: 'Chat encerrado pelo agente',
        kind: 'text',
        licensee: this.licensee._id,
        contact: contact._id,
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

  async transfer(messageId, url, token) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    const contact = await Contact.findById(messageToSend.contact._id)

    contact.talkingWithChatBot = false
    await contact.save()

    await this.sendMessage(messageId, url, token)
  }

  async sendMessage(messageId, url) {
    const messageToSend = await Message.findById(messageId).populate('contact')
    let roomId = messageToSend.contact.roomId

    if (!roomId) {
      if (await this.#createVisitor(messageToSend.contact, url) === true) {
        roomId = await this.#createRoom(messageToSend.contact, url)
        if (roomId) {
          const contact = await Contact.findById(messageToSend.contact._id)

          contact.roomId = roomId
          await contact.save()
        } else {
          return
        }
      } else {
        return
      }
    }

    if (await this.#postMessage(messageToSend.contact, messageToSend, roomId, url)) {
      messageToSend.sended = true
      await messageToSend.save()
    }
  }

  async #createVisitor(contact, url) {
    const body = {
      visitor: {
        name: `${contact.name} - ${contact.number} - WhatsApp`,
        email: `${contact.email}`,
        token: `${contact.number}${contact.type}`
      }
    }

    const response = await request.post(`${url}/api/v1/livechat/visitor`, { body })

    if (response.data.success !== true) {
      console.error(`Não foi possível criar o visitante na Rocketchat ${JSON.stringify(response.data)}`)
    }

    return response.data.success === true
  }

  async #createRoom(contact, url) {
    const response = await request.get(`${url}/api/v1/livechat/room?token=${contact.number}${contact.type}`)

    if (response.data.success !== true) {
      console.error(`Não foi possível criar a sala na Rocketchat ${JSON.stringify(response.data)}`)
      return
    }

    return response.data.room._id
  }

  async #postMessage(contact, message, roomId, url) {
    const body = {
      token: `${contact.number}${contact.type}`,
      rid: roomId,
      msg: this.#formatMessage(message, contact)
    }

    const response = await request.post(`${url}/api/v1/livechat/message`, { body })
    if (response.data.success === true) {
      console.info(`Mensagem ${message._id} enviada para Rocketchat com sucesso!`)
    } else {
      console.error(`Mensagem ${message._id} não enviada para a Rocketchat ${JSON.stringify(response.data)}`)
    }

    return response.data.success === true
  }

  #formatMessage(message, contact) {
    return contact.type === '@c.us' ? message.text : `*${contact.name}:*\n${message.text}`
  }

  async closeChat(messageId, licensee) {
    const message = await Message.findById(messageId).populate('contact')
    const contact = await Contact.findById(message.contact._id)

    contact.roomId = ''
    if (licensee.useChatbot) {
      contact.talkingWithChatBot = true
    }
    await contact.save()
  }
}

module.exports = Rocketchat

// Mensagem chegando através do webhook da Rocketchat
// {
//   _id: 'XBHdWZBXJTn4sWcc5',
//   label: 'GESSÉ FELISBERTO - WhatsApp',
//   createdAt: '2021-04-16T22:08:56.460Z',
//   lastMessageAt: '2021-04-16T22:09:13.983Z',
//   visitor: {
//     _id: 'YHcj52sTJCr26hExt',
//     token: '553188083837@c.us',
//     name: 'GESSÉ FELISBERTO - WhatsApp',
//     username: 'guest-1121',
//     email: [ [Object] ],
//     phone: null,
//     department: 'FuYCSF7quEvGNR9NC'
//   },
//   type: 'Message',
//   messages: [
//     {
//        u: [Object],
//        _id: 'xYzWL6p8jFqmrWYPH',
//        username: 'Kleber.Smart',
//        msg: 'Ola, tudo bem?\n' +
//          'Peço desculpas pela demora.\n' +
//          'Nossa equipe comercial deveria ja ter entrado em contato com você\n' +
//          'Temos uma equipe especializada para isso, vou solicitar imediatamente que os responsáveis entrem em contato com você!\n' +
//          'Muito Obrigado pelo retorno!',
//        ts: '2021-04-19T14:15:17.564Z',
//        agentId: 'kQ8zphrEL68455MyF'
//     }
//   ]
// }


// Enviando mensagens para o app de mensagens [{"chatId":"553194923089@c.us","text":"Estou  transferindo seu atendimento. Responderemos dentro do nosso horário de atendimento (segunda à sexta das 08h às 18h).\n\nPara agilizar o atendimento, por favor, informe o seu nome e o motivo do contato.","file":null,"filename":null}]
// Resposta do visitante criado na Rocketchat {"visitor":{"_id":"Z4pqikNyvjvwksYfE","username":"guest-1208","ts":"2021-04-19T10:52:59.481Z","_updatedAt":"2021-04-19T10:52:59.483Z","name":"Luiz Henrique - WhatsApp","token":"553194923089@c.us","visitorEmails":[{"address":"553194923089@mail.com"}]},"success":true}
// Resposta da criação da sala na Rocketchat {"room":{"_id":"HNpDrzmTdJB4Z3TR8","msgs":0,"usersCount":1,"lm":"2021-04-19T10:51:04.027Z","fname":"5511942215083 - WhatsApp","t":"l","ts":"2021-04-19T10:51:04.027Z","v":{"_id":"gwniTTrz84Lc9e7jH","username":"guest-569","token":"5511942215083@c.us","status":"online"},"cl":false,"open":true,"waitingResponse":true,"_updatedAt":"2021-04-19T10:51:04.027Z"},"newRoom":true,"success":true}
// Resposta do envio de mensagem para a Rocketchat {"message":{"_id":"ZNDvoAqpx6dKRTRHr","rid":"rggSv4RGwuXs8x4ky","msg":"Produto = SanMarino\n\nBom dia tudo bem?\nVi no site, lotes no San marino seu está qual valor é financia?","token":"553194923089@c.us","alias":"Luiz Henrique - WhatsApp","ts":"2021-04-19T10:52:59.817Z","u":{"_id":"Z4pqikNyvjvwksYfE","username":"guest-1208","name":"Luiz Henrique - WhatsApp"},"_updatedAt":"2021-04-19T10:52:59.905Z","mentions":[],"channels":[]},"success":true}
// Chat transferido para a Rocketchat
// {
//   chat: {
//     id: 272,
//     name: 'Luiz Henrique',
//     chatRef: '553194923089@c.us',
//     type: 'c'
//   },
//   message: {
//     message: 'Produto = SanMarino\n' +
//       '\n' +
//       'Bom dia tudo bem?\n' +
//       'Vi no site, lotes no San marino seu está qual valor é financia?'
//   },
//   contact: { senderName: 'Luiz Henrique' }
// }

// [
//   {
//     "chatId":"553194923089@c.us",
//     "text":"Estou  transferindo seu atendimento. Responderemos dentro do nosso horário de atendimento (segunda à sexta das 08h às 18h).\n\nPara agilizar o atendimento, por favor, informe o seu nome e o motivo do contato.",
//     "file":null,
//     "filename":null
//   }
// ]

// Mensagem chegando através do webhook da Rocketchat
// {
//   _id: '4sqv8qitNqhgLdvB4',
//   label: 'Luane Nichelle - 555199728783 - WhatsApp',
//   createdAt: '2021-05-12T00:55:59.599Z',
//   lastMessageAt: '2021-05-12T16:26:17.099Z',
//   tags: [],
//   visitor: {
//     _id: 'qEbPFCLXp5Frfy6PN',
//     token: '555199728783@c.us',
//     name: 'Luane Nichelle - 555199728783 - WhatsApp',
//     username: 'guest-104',
//     email: [ [Object] ],
//     phone: [ [Object], [Object] ],
//     department: 'wP47wdJuhSXeHmG6a'
//   },
//   crmData: {
//     kind: 'send_from_rocketchat_to_chatapi',
//     value: {
//       _id: '4sqv8qitNqhgLdvB4',
//       label: 'Luane Nichelle - 555199728783 - WhatsApp',
//       createdAt: '2021-05-12T00:55:59.599Z',
//       lastMessageAt: '2021-05-12T16:26:15.315Z',
//       visitor: [Object],
//       crmData: [Object],
//       type: 'Message',
//       messages: [Array]
//     }
//   },
//   type: 'LivechatSession',
//   messages: [
//     {
//       u: [Object],
//       _id: 'PuxbQuivM4oz7NXHf',
//       username: 'guest-104',
//       msg: '*Motivo atendimento:* Ajuda com compra\n\n',
//       ts: '2021-05-12T00:56:11.757Z'
//     },
//     {
//       u: [Object],
//       _id: 'dubQ9k8uwjg2HAAj7',
//       username: 'guest-104',
//       msg: 'Pasta Executiva de Couro Compact Business | Milan - 5765S PRETO',
//       ts: '2021-05-12T00:57:33.091Z'
//     },
//     {
//       u: [Object],
//       _id: 'wkbxhCEmcHPK3xoTc',
//       username: 'amanda',
//       msg: 'Olá Luane',
//       ts: '2021-05-12T10:36:39.090Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'PYLaLtzy9hopfXv8a',
//       username: 'amanda',
//       msg: 'Bom dia!',
//       ts: '2021-05-12T10:36:40.971Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'LKTaQuqyxBN8f7XtZ',
//       username: 'amanda',
//       msg: 'Tudo bem?',
//       ts: '2021-05-12T10:36:43.146Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'rJ9XY236GdM6JCuHw',
//       username: 'amanda',
//       msg: 'Como posso ajudar?',
//       ts: '2021-05-12T10:36:52.418Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'GPajMwfWegtvvzYSk',
//       username: 'guest-104',
//       msg: 'Bom dia!',
//       ts: '2021-05-12T10:39:45.113Z'
//     },
//     {
//       u: [Object],
//       _id: 'ZoDz7duHAKQjbXKq6',
//       username: 'guest-104',
//       msg: 'Estou tentando efetuar compra desde ontem',
//       ts: '2021-05-12T10:40:02.028Z'
//     },
//     {
//       u: [Object],
//       _id: 'Pom2kH9rLZGxxP9ig',
//       username: 'guest-104',
//       msg: 'Mas sempre da cartão negado',
//       ts: '2021-05-12T10:40:05.668Z'
//     },
//     {
//       u: [Object],
//       _id: 'dnMnt3ACQe77NiCnB',
//       username: 'guest-104',
//       msg: 'Já testei em outros sites e meu cartão está funcionando normalmente',
//       ts: '2021-05-12T10:40:20.062Z'
//     },
//     {
//       u: [Object],
//       _id: 'sYQD4PsumYvDG33fM',
//       username: 'guest-104',
//       msg: 'De hoje essa compra não pode passar',
//       ts: '2021-05-12T10:40:25.142Z'
//     },
//     {
//       u: [Object],
//       _id: '2tp7ipTfvkASCxcL7',
//       username: 'amanda',
//       msg: 'Poxa vida!',
//       ts: '2021-05-12T10:41:10.269Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     {
//       u: [Object],
//       _id: 'AhiPP3YXWPKExyQSL',
//       username: 'amanda',
//       msg: 'Um min.',
//       ts: '2021-05-12T10:41:13.057Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'zyDBp3YWMDcBCQZCF',
//       username: 'amanda',
//       msg: 'vou verificar aqui',
//       ts: '2021-05-12T10:41:15.388Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'ZrYX48ZeLGmWqaDpk',
//       username: 'guest-104',
//       msg: 'Certo\nAguardando',
//       ts: '2021-05-12T10:42:04.089Z'
//     },
//     {
//       u: [Object],
//       _id: 'mts45GZR7TXdj6Mfu',
//       username: 'amanda',
//       msg: 'Oii Luane',
//       ts: '2021-05-12T14:28:55.014Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'wwwgweL4NmGRgRmkR',
//       username: 'amanda',
//       msg: 'Passando pra avisar que o nosso canal de comunicação com o pagseguro está fora do ar',
//       ts: '2021-05-12T14:29:17.008Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'kxc6tMATqMwBcewiK',
//       username: 'amanda',
//       msg: 'Talvez tenha alguma instabilidade no sistema deles e por isso você não está conseguindo finalizar o pedido',
//       ts: '2021-05-12T14:29:38.785Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'aqpYfYZCdJRyeYbTg',
//       username: 'amanda',
//       msg: 'Vamos continuar tentando contato com eles',
//       ts: '2021-05-12T14:29:53.225Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: '2yK5zvhBTfvi5EqBv',
//       username: 'amanda',
//       msg: 'Você precisa fazer o pagamento no cartão, isso?',
//       ts: '2021-05-12T14:30:04.920Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: '5gkkHd9mkkmSEazGG',
//       username: 'amanda',
//       msg: 'Temos opção de pix também',
//       ts: '2021-05-12T14:30:15.580Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'kjWPKRCt2AkNM58HE',
//       username: 'guest-104',
//       msg: 'Isso precisa mesmo ser com cartão ainda hoje',
//       ts: '2021-05-12T15:04:43.027Z'
//     },
//     {
//       u: [Object],
//       _id: 'WYiCDcWWgjpb35yqu',
//       username: 'guest-104',
//       msg: 'Consegui!! Obrigada',
//       ts: '2021-05-12T16:11:19.577Z'
//     },
//     {
//       u: [Object],
//       _id: '9BLbREKNJsRzjCyPs',
//       username: 'guest-104',
//       msg: 'https://message-queue-resources.s3.amazonaws.com/12-4-2021/555199728783/3AE423361257D6B1699E.jpg',
//       ts: '2021-05-12T16:11:20.091Z'
//     },
//     {
//       u: [Object],
//       _id: 'PEbT8Y3qfwHQp9mqN',
//       username: 'guest-104',
//       msg: 'Sem querer eu escrevi atenciosamente errado, vocês poderiam corrigir por gentileza?',
//       ts: '2021-05-12T16:14:41.661Z'
//     },
//     {
//       u: [Object],
//       _id: 'QLaiecYsrmxAcoXF2',
//       username: 'guest-104',
//       msg: 'https://message-queue-resources.s3.amazonaws.com/12-4-2021/555199728783/3A02BAE64EE1EAC85CE5.jpg',
//       ts: '2021-05-12T16:14:42.085Z'
//     },
//     {
//       u: [Object],
//       _id: 'Xced6t8tRkZhxJ2zC',
//       username: 'amanda',
//       msg: 'Clarooo!',
//       ts: '2021-05-12T16:26:15.315Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'rGDiXjpBb5fXAfAcF',
//       username: 'amanda',
//       msg: 'pode deixar!',
//       ts: '2021-05-12T16:26:17.099Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo'
//     },
//     {
//       u: [Object],
//       _id: 'ou4LGLFdsi8tynQb4',
//       username: 'amanda',
//       msg: ' Estou encerrando seu atendimento. Precisando de algo é só nos chamar novamente :) A Bennemann deseja a você um ótimo dia!',
//       ts: '2021-05-13T10:39:59.947Z',
//       agentId: 'ZnTJu5mzqdDeaZKoo',
//       closingMessage: true
//     }
//   ],
//   departmentId: 'wP47wdJuhSXeHmG6a',
//   closedAt: '2021-05-13T10:39:59.912Z',
//   closedBy: { _id: 'ZnTJu5mzqdDeaZKoo', username: 'amanda' },
//   closer: 'user'
// }
