const { io } = require('../../config/http')
const queueServer = require('@config/queue')
const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')

io.on('connect', (socket) => {
  io.emit('load_messenger', { data: 'carregando' })

  socket.on('send_message', async (params) => {
    const { user, message, contactId } = params

    const messageToSend = new Message({
      number: uuidv4(),
      licensee: user.licensee._id,
      contact: contactId,
      destination: 'to-messenger',
      text: message,
    })

    const messageSaved = await messageToSend.save()
    // Inserir mensagem no banco de dados
    await queueServer.addJob('send-message-to-messenger', {
      messageId: messageSaved._id.toString(),
      url: user.licensee.whatsappUrl,
      token: user.licensee.whatsappToken,
    })

    io.emit('send_message', { data: 'mensagem enviada' })
  })
})
