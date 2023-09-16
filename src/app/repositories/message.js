const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const Trigger = require('@models/Trigger')
const { parseText } = require('@helpers/ParseTriggerText')
const emoji = require('@helpers/Emoji')

async function createMessage(fields) {
  const message = new Message({
    number: uuidv4(),
    ...fields,
  })

  const messageSaved = await message.save()

  return messageSaved
}

async function createInteractiveMessages(fields) {
  const messages = []

  const text = emoji.replace(fields.text)

  const triggers = await Trigger.find({ expression: text, licensee: fields.licensee }).sort({ order: 'asc' })
  if (triggers.length > 0) {
    for (const trigger of triggers) {
      messages.push(
        await createMessage({
          ...fields,
          kind: 'interactive',
          text,
          trigger: trigger._id,
        }),
      )
    }
  } else {
    messages.push(
      await createMessage({
        ...fields,
        kind: 'text',
        text,
      }),
    )
  }

  return messages
}

async function createTextMessageInsteadInteractive(fields) {
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

async function createMessageToWarnAboutWindowOfWhatsassHasExpired(contact, licensee) {
  const message = new Message({
    number: uuidv4(),
    kind: 'text',
    contact,
    licensee,
    destination: 'to-chat',
    text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou. Envie um Template para voltar a interagir com esse contato.',
  })

  const messageSaved = await message.save()
  return messageSaved
}

async function createMessageToWarnAboutWindowOfWhatsassIsEnding(contact, licensee) {
  const message = new Message({
    number: uuidv4(),
    kind: 'text',
    contact,
    licensee,
    destination: 'to-chat',
    text: '🚨 ATENÇÃO\nO período de 24h para manter conversas está quase expirando. Faltam apenas 10 minutos para encerrar.',
  })

  const messageSaved = await message.save()
  return messageSaved
}

module.exports = {
  createMessage,
  createMessageToWarnAboutWindowOfWhatsassHasExpired,
  createMessageToWarnAboutWindowOfWhatsassIsEnding,
  createTextMessageInsteadInteractive,
  createInteractiveMessages,
}
