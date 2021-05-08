class Rocketchat {
  constructor(requestBody) {
    this.action = this.#defineAction(requestBody)
    this.transformdedBody = this.#transformaBody(requestBody)
  }

  #defineAction(requestBody) {
    let action = ''
    if (requestBody.type.toLowerCase() === 'message') {
      action = 'send-message-to-messenger'
    } else if (requestBody.type.toLowerCase() === 'livechatsession') {
      action = 'close-chat'
    }

    return action
  }

  #transformaBody(requestBody) {
    if (this.action === 'close-chat') {
      return requestBody._id
    } else {
      //_id é o id da sala da conversa

      return requestBody
    }
  }

  action() {
    return this.action
  }

  sendMessage() {
    //Verificar se já tem roomId no contact
    //Se não tiver, criar o visitante no livechat
    //  buscar o roomId utilizando o chatRef como token
    //  salvar o roomId no contato
    //Enviar mensagem
  }

  closeChat() {
    // modificar no licenciado o roomId para nulo e também o talkingWithChatBot caso o licenciado use chatBot
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
