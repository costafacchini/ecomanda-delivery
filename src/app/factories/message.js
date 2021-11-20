const { Factory } = require('fishery')
const { licensee } = require('./licensee')
const { contact } = require('./contact')

const message = Factory.define(() => ({
  text: 'Message 1',
  number: '5511990283745',
  contact: contact.build(),
  licensee: licensee.build(),
  destination: 'to-chat',
  sended: true,
  createdAt: new Date(2021, 6, 3, 0, 0, 0),
}))

module.exports = { message }
