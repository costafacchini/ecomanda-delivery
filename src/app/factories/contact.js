const { Factory } = require('fishery')
const { licensee } = require('./licensee')

const contact = Factory.define(() => ({
  number: '5511990283745',
  talkingWithChatBot: false,
  licensee: licensee.build(),
}))

module.exports = { contact }
