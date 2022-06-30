const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const { parseText } = require('@helpers/ParseTriggerText')

async function createMessage(fields) {
  const message = new Message({
    number: uuidv4(),
    ...fields,
  })

  if (message.kind === 'interactive') {
    message.kind = 'text'
    message.text = await parseText(message.text, message.contact)
  }

  const messageSaved = await message.save()

  return messageSaved
}

async function createMessageToWarnAboutWindowOfWhatsassClosed(contact, licensee) {
  const message = new Message({
    number: uuidv4(),
    kind: 'text',
    contact,
    licensee,
    destination: 'to-chat',
    text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou.Envie um Template para voltar a interagir com esse contato.',
  })

  const messageSaved = await message.save()
  return messageSaved
}

module.exports = { createMessage, createMessageToWarnAboutWindowOfWhatsassClosed }
