const { v4: uuidv4 } = require('uuid')
const Message = require('@models/Message')
const parseText = require('@helpers/ParseTriggerText')

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

module.exports = { createMessage }
